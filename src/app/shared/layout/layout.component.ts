import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
<div class="app-layout">

  <!-- ── Sidebar ─────────────────────────────────────────────────────── -->
  <aside class="sidebar">

    <!-- Brand -->
    <div class="sidebar__brand">
      <div class="sidebar__logo">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="1"/>
          <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
          <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
          <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3"/>
        </svg>
      </div>
      <div>
        <div class="sidebar__name">StockTech</div>
        <div class="sidebar__tagline">Gestión Empresarial</div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar__nav">
      <div class="sidebar__section-label">Principal</div>

      <a routerLink="/dashboard" routerLinkActive="active" class="sidebar__link">
        <svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor"/>
          <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5"/>
          <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5"/>
          <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3"/>
        </svg>
        <span>Dashboard</span>
      </a>

      <div class="sidebar__section-label" style="margin-top:14px">Operaciones</div>

      <a routerLink="/clients" routerLinkActive="active" class="sidebar__link">
        <svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="6" r="3" fill="currentColor"/>
          <path d="M2 17.5C2 14.46 4.686 12 8 12s6 2.46 6 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M15 8a3 3 0 010 0M15 8a2 2 0 112.5 1.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
        </svg>
        <span>Clientes</span>
      </a>

      <a routerLink="/products" routerLinkActive="active" class="sidebar__link">
        <svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2L3 5.5v8L10 18l7-4.5v-8L10 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="currentColor" fill-opacity="0.15"/>
          <path d="M10 2v8m0 0l7-3.5M10 10L3 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Inventario</span>
      </a>

      <a routerLink="/suppliers" routerLinkActive="active" class="sidebar__link">
        <svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4h12v12H4z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
          <path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Suplidores</span>
      </a>

      <a routerLink="/branches" routerLinkActive="active" class="sidebar__link">
        <svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 7l7-4 7 4v9l-7 4-7-4V7z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
          <path d="M10 3v18m7-14l-7 4-7-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Sucursales</span>
      </a>

      <a routerLink="/invoices" routerLinkActive="active" class="sidebar__link">
        <svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
          <path d="M6.5 6.5h7M6.5 10h7M6.5 13.5h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Facturación</span>
      </a>

      <a routerLink="/purchases" routerLinkActive="active" class="sidebar__link">
        <svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3h1.5l2.4 8.5h8.2l1.9-6H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="9" cy="16.5" r="1.2" fill="currentColor"/>
          <circle cx="14" cy="16.5" r="1.2" fill="currentColor"/>
        </svg>
        <span>Compras</span>
      </a>

      <a routerLink="/reports" routerLinkActive="active" class="sidebar__link">
        <svg class="sidebar__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 14l4-5 4 2.5 3-4.5 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="3" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
        </svg>
        <span>Reportes</span>
      </a>
    </nav>

    <!-- User Footer -->
    <div class="sidebar__footer">
      <div class="sidebar__user">
        <div class="sidebar__avatar">{{ username.charAt(0).toUpperCase() }}</div>
        <div class="sidebar__user-info">
          <div class="sidebar__username">{{ username }}</div>
          <div class="sidebar__role">Administrador</div>
        </div>
      </div>
      <button class="sidebar__logout" (click)="logout()" title="Cerrar sesión" id="logout-btn">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M11 5l3 3-3 3M14 8H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

  </aside>

  <!-- ── Main Content ──────────────────────────────────────────────────── -->
  <main class="main-content">
    <router-outlet />
  </main>

</div>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      width: 240px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: 100;
      // Subtle left brand stripe
      &::before {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 2px;
        background: linear-gradient(180deg, var(--accent) 0%, transparent 60%);
        opacity: 0.6;
      }

      // Brand area
      &__brand {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 20px 18px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 4px;
      }

      &__logo {
        width: 38px; height: 38px;
        background: var(--accent);
        color: var(--text-inverse);
        border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 16px var(--accent-glow);
      }

      &__name {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      &__tagline {
        font-size: 0.68rem;
        color: var(--text-muted);
        margin-top: 1px;
        letter-spacing: 0.02em;
      }

      // Navigation
      &__nav {
        flex: 1;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow-y: auto;
      }

      &__section-label {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        padding: 6px 10px 4px;
      }

      &__link {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 9px 10px;
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-muted);
        transition: all var(--transition);
        position: relative;

        &:hover {
          background: var(--bg-elevated);
          color: var(--text-secondary);
        }

        &.active {
          background: var(--accent-dim);
          color: var(--accent);
          font-weight: 600;

          // Left indicator
          &::before {
            content: '';
            position: absolute;
            left: -10px;
            top: 25%; bottom: 25%;
            width: 2px;
            background: var(--accent);
            border-radius: 0 2px 2px 0;
          }
        }
      }

      &__icon {
        width: 17px; height: 17px;
        flex-shrink: 0;
      }

      // Footer
      &__footer {
        padding: 14px;
        border-top: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      &__user {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
      }

      &__user-info { min-width: 0; }

      &__avatar {
        width: 32px; height: 32px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-hover);
        border-radius: var(--radius-sm);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 0.8rem;
        color: var(--accent);
        flex-shrink: 0;
      }

      &__username {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &__role {
        font-size: 0.68rem;
        color: var(--text-muted);
        margin-top: 1px;
      }

      &__logout {
        background: transparent;
        border: 1px solid var(--border-hover);
        border-radius: var(--radius-sm);
        width: 32px; height: 32px;
        cursor: pointer;
        color: var(--text-muted);
        display: flex; align-items: center; justify-content: center;
        transition: all var(--transition);
        flex-shrink: 0;

        &:hover {
          background: var(--danger-dim);
          color: var(--danger);
          border-color: rgba(244,63,94,0.25);
        }
      }
    }
  `]
})
export class LayoutComponent {
  username = this.authState.getUser()?.username ?? 'Usuario';
  constructor(private authState: AuthStateService) {}
  logout() { this.authState.logout(); }
}
