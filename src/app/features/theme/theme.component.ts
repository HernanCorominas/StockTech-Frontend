import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ThemeSettings } from '../../core/services/theme.service';
import { AnimationService } from '../../core/services/animation.service';

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="theme-panel glass rounded-3xl p-8 shadow-2xl border border-white/20">
      <div class="flex items-center justify-between mb-8">
        <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Personalización Premium
        </h3>
      </div>

      <div class="space-y-8">
        <!-- System Color -->
        <div class="space-y-4">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-widest block">Color Principal del Sistema</label>
          <div class="flex items-center gap-4">
            <input 
              type="color" 
              [ngModel]="settings().primaryColor" 
              (ngModelChange)="updateColor($event)"
              class="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
            />
            <div class="flex gap-2">
              <button 
                *ngFor="let color of presets" 
                (click)="updateColor(color)"
                [style.background-color]="color"
                class="w-8 h-8 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                [class.scale-125]="settings().primaryColor === color"
              ></button>
            </div>
          </div>
        </div>

        <!-- Animation Intensity -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Intensidad de Animación (Estilo iPhone)</label>
            <span class="text-xs font-mono text-accent font-bold">{{ settings().animationIntensity | number:'1.1-1' }}x</span>
          </div>
          <input 
            type="range" 
            min="0.4" 
            max="2.5" 
            step="0.1" 
            [ngModel]="settings().animationIntensity"
            (ngModelChange)="updateAnimation($event)"
            class="w-full accent-accent"
          />
          <div class="flex justify-between text-[10px] text-slate-400 font-bold">
            <span>INSTANTÁNEO</span>
            <span>FLUIDO</span>
            <span>CINEMÁTICO</span>
          </div>
        </div>

        <!-- Gradient Intensity -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Intensidad del Fondo Radial</label>
            <span class="text-xs font-mono text-accent font-bold">{{ settings().gradientIntensity * 100 | number:'1.0-0' }}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="0.4" 
            step="0.05" 
            [ngModel]="settings().gradientIntensity"
            (ngModelChange)="updateGradient($event)"
            class="w-full accent-accent"
          />
        </div>

        <div class="pt-4">
          <button (click)="reset()" class="text-[10px] font-bold text-slate-400 hover:text-accent uppercase tracking-widest transition-colors">
            Restablecer Valores por Defecto
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .theme-panel {
      width: 100%;
      max-width: 400px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    input[type="range"] {
      height: 6px;
      border-radius: 5px;
      appearance: none;
      background: #e2e8f0;
      outline: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--accent);
      cursor: pointer;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  `]
})
export class ThemeComponent {
  private theme = inject(ThemeService);
  
  settings = this.theme.settings;
  presets = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  updateColor(color: string) {
    this.theme.updateSettings({ primaryColor: color });
  }

  updateAnimation(val: number) {
    this.theme.updateSettings({ animationIntensity: val });
  }

  updateGradient(val: number) {
    this.theme.updateSettings({ gradientIntensity: val });
  }

  reset() {
    this.theme.updateSettings({
      primaryColor: '#3b82f6',
      gradientIntensity: 0.15,
      animationIntensity: 1.0
    });
  }
}
