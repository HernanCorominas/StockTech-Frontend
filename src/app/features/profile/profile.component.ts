import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  private authState = inject(AuthStateService);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/users/change-password`;

  user = this.authState.currentUser;
  avatar = () => this.user()?.username?.charAt(0).toUpperCase() || '?';
  
  newPassword = '';
  confirmPassword = '';
  loading = signal(false);
  message = signal('');
  isError = signal(false);

  updatePassword() {
    if (this.newPassword !== this.confirmPassword) return;

    this.loading.set(true);
    this.message.set('');
    
    this.http.post(this.apiUrl, { newPassword: this.newPassword }).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set('Contraseña actualizada con éxito');
        this.isError.set(false);
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err: any) => {
        this.loading.set(false);
        this.message.set(err.error?.message || 'Error al actualizar contraseña');
        this.isError.set(true);
      }
    });
  }
}
