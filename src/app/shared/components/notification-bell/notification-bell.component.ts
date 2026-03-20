import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <button 
        type="button" 
        (click)="isMenuOpen.set(!isMenuOpen())"
        class="p-2 text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        @if (unreadCount() > 0) {
          <span class="absolute top-1 right-1 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">
              {{ unreadCount() }}
            </span>
          </span>
        }
      </button>

      @if (isMenuOpen()) {
        <div class="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 z-[100] animate-in fade-in zoom-in duration-200">
          <div class="px-4 py-3 flex items-center justify-between bg-slate-50 rounded-t-xl">
            <h3 class="text-sm font-bold text-slate-900">Notificaciones</h3>
            <button (click)="markAsRead()" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Marcar como leído</button>
          </div>
          <div class="max-h-96 overflow-y-auto scrollbar-hide">
            @if (notifications().length === 0) {
              <div class="px-4 py-8 text-center text-slate-400">
                <p class="text-xs">No tienes notificaciones</p>
              </div>
            }
            @for (notif of notifications(); track notif.id) {
              <div class="px-4 py-3 hover:bg-slate-50 transition-colors cursor-default border-l-4" [class.border-indigo-500]="!notif.isRead" [class.border-transparent]="notif.isRead">
                <p class="text-sm text-slate-800 leading-snug">{{ notif.message }}</p>
                <p class="text-[10px] text-slate-400 mt-1">{{ notif.date | date:'shortTime' }}</p>
              </div>
            }
          </div>
          @if (notifications().length > 0) {
            <div class="px-4 py-2 text-center bg-slate-50/50 rounded-b-xl">
              <button (click)="clearAll()" class="text-xs text-slate-500 hover:text-red-500 transition-colors">Limpiar historial</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class NotificationBellComponent {
  private service = inject(NotificationService);
  
  notifications = this.service.notifications;
  unreadCount = this.service.unreadCount;
  isMenuOpen = signal(false);

  markAsRead() {
    this.service.markAsRead();
  }

  clearAll() {
    this.service.clear();
    this.isMenuOpen.set(false);
  }
}
