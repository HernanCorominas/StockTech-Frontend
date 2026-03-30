import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
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