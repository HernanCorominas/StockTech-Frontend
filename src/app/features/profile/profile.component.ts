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
  template: `
    <div class="page-header">
      <div>
        <h1>Mi Perfil</h1>
        <p>Gestiona tu información de cuenta</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      <!-- Info Card -->
      <div class="col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
        <div class="w-32 h-32 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold mb-6 border-4 border-white shadow-xl">
          {{ avatar() }}
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-1">{{ user()?.username }}</h2>
        <span class="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider mb-8">
          {{ user()?.role }}
        </span>
        
        <div class="w-full space-y-4">
          <div class="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Nombre Completo</span>
            <span class="text-sm font-semibold text-slate-800">{{ user()?.fullName || 'No definido' }}</span>
          </div>
          <div class="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Correo Electrónico</span>
            <span class="text-sm font-semibold text-slate-800">{{ user()?.email || 'No definido' }}</span>
          </div>
        </div>
      </div>

      <!-- Security Card -->
      <div class="col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          Seguridad de la Cuenta
        </h3>

        <form (ngSubmit)="updatePassword()" #form="ngForm">
          <div class="space-y-6">
            <div class="form-group">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Nueva Contraseña</label>
              <input 
                type="password" 
                [(ngModel)]="newPassword" 
                name="newPassword" 
                required 
                minlength="6"
                placeholder="Ingresa al menos 6 caracteres"
                class="w-full bg-slate-50 border-slate-100 focus:bg-white transition-all"
              />
            </div>
            <div class="form-group">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Confirmar Contraseña</label>
              <input 
                type="password" 
                [(ngModel)]="confirmPassword" 
                name="confirmPassword" 
                required
                placeholder="Repite la nueva contraseña"
                class="w-full bg-slate-50 border-slate-100 focus:bg-white transition-all"
              />
            </div>

            <div *ngIf="message()" class="p-4 rounded-xl" [class.bg-green-50]="!isError()" [class.text-green-700]="!isError()" [class.bg-red-50]="isError()" [class.text-red-700]="isError()">
              {{ message() }}
            </div>

            <button 
              type="submit" 
              [disabled]="form.invalid || loading() || newPassword !== confirmPassword"
              class="btn btn--primary w-full h-12 flex items-center justify-center gap-2 shadow-indigo-100"
            >
              @if (loading()) {
                <span class="spinner-sm"></span> Actualizando...
              } @else {
                Actualizar Contraseña
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animate: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
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
      error: (err) => {
        this.loading.set(false);
        this.message.set(err.error?.message || 'Error al actualizar contraseña');
        this.isError.set(true);
      }
    });
  }
}
