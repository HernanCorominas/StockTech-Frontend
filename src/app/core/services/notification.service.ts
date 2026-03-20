import { Injectable, signal, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthStateService } from './auth-state.service';

export interface AppNotification {
  id: string;
  message: string;
  date: Date;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection?: signalR.HubConnection;
  private authState = inject(AuthStateService);
  
  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);

  constructor() {
    // Start connection when user is logged in
    this.authState.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.startConnection();
      } else {
        this.stopConnection();
      }
    });
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.replace('/api/v1', '')}/notificationHub`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
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
    
    // Auto-remove after 10 seconds or keep in history?
    // For now, keep in history.
  }

  markAsRead() {
    this.notifications.update(prev => prev.map(n => ({ ...n, isRead: true })));
    this.unreadCount.set(0);
  }

  clear() {
    this.notifications.set([]);
    this.unreadCount.set(0);
  }
}
