import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ColorPreset } from '../../../core/services/theme.service';
import { AnimationService } from '../../../core/services/animation.service';
import gsap from 'gsap';

@Component({
  selector: 'app-appearance-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appearance-dialog.component.html',
  styleUrls: ['./appearance-dialog.component.scss']
})
export class AppearanceDialogComponent implements OnInit {
  isOpen = signal(false);

  colors = [
    { name: 'StockTech Blue', value: '#2563EB', isDark: true },
    { name: 'Midnight', value: '#1E293B', isDark: true },
    { name: 'Emerald', value: '#10B981', isDark: true },
    { name: 'Amethyst', value: '#8B5CF6', isDark: true },
    { name: 'Rose', value: '#F43F5E', isDark: true },
    { name: 'Amber', value: '#F59E0B', isDark: false }
  ];

  constructor(
    public themeService: ThemeService,
    private animationService: AnimationService
  ) {}

  ngOnInit(): void {}

  toggleDialog() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      gsap.fromTo('.appearance-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power3.out' });
      gsap.fromTo('.appearance-modal', 
        { y: '100%', scale: 0.9, opacity: 0 }, 
        { y: '0%', scale: 1, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    } else {
      gsap.to('.appearance-backdrop', { opacity: 0, duration: 0.3, ease: 'power3.in' });
      gsap.to('.appearance-modal', 
        { y: '100%', scale: 0.9, opacity: 0, duration: 0.4, ease: 'expo.in' }
      );
    }
  }

  setColor(preset: ColorPreset) {
    this.themeService.setPrimaryColor(preset);
  }

  updateGradient(event: Event) {
    const target = event.target as HTMLInputElement;
    this.themeService.setGradientIntensity(parseFloat(target.value));
  }

  updateAnimation(event: Event) {
    const target = event.target as HTMLInputElement;
    this.themeService.setAnimationIntensity(parseFloat(target.value));
  }
}
