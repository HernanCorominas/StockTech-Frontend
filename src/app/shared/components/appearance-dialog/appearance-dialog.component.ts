import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ColorPreset } from '../../../core/services/theme.service';
import { FlipAnimationService } from '../../../core/services/flip-animation.service';
import gsap from 'gsap';

import { FlipTriggerDirective } from '../../../shared/directives/flip-trigger.directive';

@Component({
  selector: 'app-appearance-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, FlipTriggerDirective],
  templateUrl: './appearance-dialog.component.html',
  styleUrls: ['./appearance-dialog.component.scss']
})
export class AppearanceDialogComponent implements OnInit {
  public themeService = inject(ThemeService);
  private anime = inject(FlipAnimationService);

  isOpen = signal(false);

  colors = [
    { name: 'StockTech Blue', value: '#2563EB', isDark: true },
    { name: 'Midnight', value: '#1E293B', isDark: true },
    { name: 'Emerald', value: '#10B981', isDark: true },
    { name: 'Amethyst', value: '#8B5CF6', isDark: true },
    { name: 'Rose', value: '#F43F5E', isDark: true },
    { name: 'Amber', value: '#F59E0B', isDark: false }
  ];

  ngOnInit(): void {}

  toggleDialog() {
    const state = this.anime.getState('[data-flip-id="appearance-dialog"]');
    const isOpening = !this.isOpen();
    
    if (isOpening) {
      this.isOpen.set(true);
      requestAnimationFrame(() => {
        this.anime.from(state, { fromRadius: '50%', borderRadius: '32px' });
        const modal = document.querySelector('.appearance-modal') as HTMLElement;
        
        if (modal) {
          this.anime.animateModal(modal);
          setTimeout(() => this.anime.animateContent(modal, '.appearance-modal__body > *'), 100);
        }
      });
    } else {
      const modal = document.querySelector('.appearance-modal') as HTMLElement;
      this.anime.animateModalOut(modal)?.eventCallback('onComplete', () => {
        this.isOpen.set(false);
        this.anime.from(state, { fromRadius: '50%', borderRadius: '32px' });
      });
    }
  }

  setColor(preset: ColorPreset) { this.themeService.setPrimaryColor(preset); }

  updateGradient(event: Event) {
    const target = event.target as HTMLInputElement;
    this.themeService.setGradientIntensity(parseFloat(target.value));
  }

  updateAnimation(event: Event) {
    const target = event.target as HTMLInputElement;
    this.themeService.setAnimationIntensity(parseFloat(target.value));
  }
}
