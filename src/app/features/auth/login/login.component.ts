import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthStateService } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="login-root">

  <!-- Left panel — brand -->
  <div class="login-panel login-panel--brand" aria-hidden="true">
    <div class="brand-content">
      <div class="brand-logo">
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" opacity="1"/>
          <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" opacity="0.6"/>
          <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity="0.6"/>
          <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity="0.3"/>
        </svg>
      </div>
      <h1 class="brand-name">StockTech</h1>
      <p class="brand-desc">Plataforma de gestión empresarial para la empresa tecnológica moderna.</p>

      <div class="brand-features">
        <div class="brand-feature">
          <div class="brand-feature__dot"></div>
          <span>Control de inventario en tiempo real</span>
        </div>
        <div class="brand-feature">
          <div class="brand-feature__dot"></div>
          <span>Facturación electrónica completa</span>
        </div>
        <div class="brand-feature">
          <div class="brand-feature__dot"></div>
          <span>Reportes exportables a Excel</span>
        </div>
        <div class="brand-feature">
          <div class="brand-feature__dot"></div>
          <span>Dashboard analítico avanzado</span>
        </div>
      </div>
    </div>

    <!-- Decorative grid pattern -->
    <div class="brand-grid" aria-hidden="true">
      <div *ngFor="let _ of gridDots" class="brand-grid__dot"></div>
    </div>
  </div>

  <!-- Right panel — form -->
  <div class="login-panel login-panel--form">
    <div class="login-form-wrap">

      <div class="login-header">
        <div class="login-eyebrow">Bienvenido de vuelta</div>
        <h2>Inicia sesión</h2>
        <p>Accede a tu cuenta de StockTech</p>
      </div>

      <div *ngIf="error" class="alert alert--error" role="alert">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" style="flex-shrink:0">
          <path d="M7.5 1.5a6 6 0 100 12 6 6 0 000-12zm0 4.25a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V6.5a.75.75 0 01.75-.75zm0 5.5a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
        </svg>
        {{ error }}
      </div>

      <form (ngSubmit)="login()" #f="ngForm" id="login-form">
        <div class="form-group">
          <label for="username-input">Usuario</label>
          <input
            id="username-input"
            type="text"
            [(ngModel)]="username"
            name="username"
            placeholder="Ej: admin"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password-input">Contraseña</label>
          <div class="password-wrap">
            <input
              id="password-input"
              [type]="showPassword ? 'text' : 'password'"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
            <button type="button" class="password-toggle" (click)="showPassword = !showPassword" tabindex="-1">
              <svg *ngIf="!showPassword" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3C4.133 3 1 8 1 8s3.133 5 7 5 7-5 7-5-3.133-5-7-5z" stroke="currentColor" stroke-width="1.3"/>
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.3"/>
              </svg>
              <svg *ngIf="showPassword" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M7 3.1C7.3 3.04 7.65 3 8 3c3.867 0 7 5 7 5a13.4 13.4 0 01-1.96 2.55M5.17 5.17A6.6 6.6 0 001 8s3.133 5 7 5c1.47 0 2.83-.55 3.93-1.47" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn--primary login-submit"
          [disabled]="loading"
          id="login-submit-btn"
        >
          <span class="login-spinner" *ngIf="loading"></span>
          <span *ngIf="!loading">Iniciar Sesión</span>
          <span *ngIf="loading">Verificando...</span>
        </button>
      </form>

      <p class="login-footer-note">
        StockTech &mdash; República Dominicana &copy; {{ year }}
      </p>
    </div>
  </div>

</div>
  `,
  styles: [`
    .login-root {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary);
    }

    // ── Left brand panel ──────────────────────────────────────────────
    .login-panel--brand {
      flex: 0 0 420px;
      background: var(--accent);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      padding: 48px;

      @media (max-width: 860px) { display: none; }
    }

    .brand-content {
      position: relative;
      z-index: 2;
      color: var(--text-inverse);
    }

    .brand-logo {
      width: 52px; height: 52px;
      background: rgba(0,0,0,0.15);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }

    .brand-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--text-inverse);
      line-height: 1;
      margin-bottom: 14px;
    }

    .brand-desc {
      font-size: 0.9rem;
      color: rgba(0,0,0,0.55);
      line-height: 1.55;
      margin-bottom: 32px;
      max-width: 280px;
    }

    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .brand-feature {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      color: rgba(0,0,0,0.7);
      font-weight: 500;

      &__dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: rgba(0,0,0,0.4);
        flex-shrink: 0;
      }
    }

    // Decorative dot grid
    .brand-grid {
      position: absolute;
      top: 0; right: 0;
      width: 180px; height: 100%;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 18px;
      padding: 24px;
      z-index: 1;
      opacity: 0.2;

      &__dot {
        width: 3px; height: 3px;
        border-radius: 50%;
        background: rgba(0,0,0,0.5);
        align-self: center;
        justify-self: center;
      }
    }

    // ── Right form panel ──────────────────────────────────────────────
    .login-panel--form {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }

    .login-form-wrap {
      width: 100%;
      max-width: 380px;
      animation: slideUp 0.3s var(--ease);
    }

    .login-header {
      margin-bottom: 32px;

      .login-eyebrow {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--accent);
        margin-bottom: 8px;
      }

      h2 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.03em;
        margin-bottom: 6px;
      }

      p {
        font-size: 0.875rem;
        color: var(--text-muted);
      }
    }

    // Password input with toggle
    .password-wrap {
      position: relative;

      input { width: 100%; padding-right: 44px; }
    }

    .password-toggle {
      position: absolute;
      right: 10px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      display: flex; align-items: center;
      transition: color var(--transition);

      &:hover { color: var(--text-secondary); }
    }

    // Submit button
    .login-submit {
      width: 100%;
      justify-content: center;
      padding: 12px;
      font-size: 0.925rem;
      margin-top: 6px;
      position: relative;
    }

    .login-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(0,0,0,0.2);
      border-top-color: var(--text-inverse);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    .login-footer-note {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: center;
      margin-top: 28px;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;
  year = new Date().getFullYear();
  // 72 dots (12 cols × 6 visible rows) for grid decoration
  gridDots = Array(72).fill(0);

  constructor(
    private api: ApiService,
    private authState: AuthStateService,
    private router: Router
  ) {}

  login(): void {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';

    this.api.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.authState.saveSession(res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Usuario o contraseña incorrectos';
        this.loading = false;
      }
    });
  }
}
