import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="coming-soon-container page-enter">
      <div class="coming-soon-card">
        <div class="coming-soon-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
            <path d="M12 8V12L14 14" stroke-linecap="round" />
            <path d="M19 19L21 21M3 3L5 5" stroke-linecap="round" />
          </svg>
        </div>
        <h2>{{ featureName }}</h2>
        <p>Estamos trabajando duro para traerte esta funcionalidad. Estará disponible muy pronto como parte de nuestra suite premium.</p>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <button class="btn btn--primary" (click)="goBack()">Volver al Inicio</button>
      </div>
    </div>
  `,
  styles: [`
    .coming-soon-container {
      display: flex; align-items: center; justify-content: center;
      min-height: calc(100vh - var(--navbar-height) - 100px);
    }
    .coming-soon-card {
      max-width: 480px; text-align: center; padding: 60px 40px;
      background: var(--bg-card); backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border); border-radius: 24px;
      display: flex; flex-direction: column; align-items: center; gap: 20px;
      box-shadow: var(--shadow);
    }
    .coming-soon-icon {
      width: 80px; height: 80px; background: var(--accent-dim);
      color: var(--accent); border-radius: 20px; display: flex;
      align-items: center; justify-content: center; margin-bottom: 10px;
    }
    .coming-soon-icon svg { width: 44px; height: 44px; }
    h2 { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    p { font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0; }
    .progress-bar {
      width: 100%; height: 6px; background: var(--bg-elevated);
      border-radius: 3px; overflow: hidden; margin: 10px 0;
    }
    .progress-fill {
      width: 75%; height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-hover));
      animation: shimmer 2s infinite linear;
    }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
  `]
})
export class ComingSoonComponent {
  @Input() featureName: string = 'Funcionalidad en Desarrollo';

  goBack() { window.history.back(); }
}
