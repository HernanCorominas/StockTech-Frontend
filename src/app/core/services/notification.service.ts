import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthStateService } from './auth-state.service';
import { toObservable } from '@angular/core/rxjs-interop';

export interface AppNotification {
  id: string;
  message: string;
  type?: string;
  date: Date;
  isRead: boolean;
  createdAt?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection?: signalR.HubConnection;
  private authState = inject(AuthStateService);
  private http = inject(HttpClient);
  
  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);

  constructor() {
    toObservable(this.authState.isAuthenticated).subscribe((isAuth: boolean) => {
      if (isAuth) {
        this.loadHistory();
        this.startConnection();
      } else {
        this.stopConnection();
      }
    });
  }

  private loadHistory() {
    this.http.get<AppNotification[]>(`${environment.apiUrl}/notifications`)
      .subscribe(data => {
        const mapped = data.map(n => ({
          ...n,
          date: n.createdAt ? new Date(n.createdAt) : new Date()
        }));
        this.notifications.set(mapped);
        this.unreadCount.set(mapped.filter(n => !n.isRead).length);
      });
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.split('/api')[0]}/notificationHub`, {
        accessTokenFactory: () => this.authState.getToken() || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('Error starting SignalR:', err));

    this.hubConnection.on('ReceiveNotification', (message: string) => {
      this.addNotification(message);
    });
  }

  private stopConnection() {
    this.hubConnection?.stop();
    this.notifications.set([]);
    this.unreadCount.set(0);
  }

  private addNotification(message: string) {
    const newNotification: AppNotification = {
      id: Math.random().toString(36).substring(7),
      message,
      date: new Date(),
      isRead: false
    };

    this.notifications.update(prev => [newNotification, ...prev]);
    this.unreadCount.update(count => count + 1);
  }

  markAsRead() {
    this.http.post(`${environment.apiUrl}/notifications/mark-all-read`, {})
      .subscribe(() => {
        this.notifications.update(prev => prev.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      });
  }

  clear() {
    this.notifications.set([]);
    this.unreadCount.set(0);
  }
}
