import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="forbidden-container">
      <div class="forbidden-card">
        <div class="icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#EF4444" stroke-opacity="0.2"/>
            <path d="M12 8V12" stroke="#EF4444" stroke-linecap="round"/>
            <path d="M12 16H12.01" stroke="#EF4444" stroke-linecap="round"/>
          </svg>
        </div>
        <h1>Acceso Restringido</h1>
        <p>No tienes los permisos suficientes para acceder a esta sección. Si crees que esto es un error, contacta al administrador.</p>
        <button routerLink="/dashboard" class="btn btn--primary">Volver al Inicio</button>
      </div>
    </div>
  `,
  styles: [`
    .forbidden-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 2rem;
      background: var(--bg-primary);
    }
    .forbidden-card {
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      padding: 3rem;
      border-radius: 32px;
      text-align: center;
      max-width: 500px;
      width: 100%;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .icon-wrapper {
      width: 80px;
      height: 80px;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 24px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-wrapper svg { width: 40px; height: 40px; }
    h1 { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1rem; }
    p { color: var(--text-muted); line-height: 1.6; margin-bottom: 2rem; }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ForbiddenComponent {}
