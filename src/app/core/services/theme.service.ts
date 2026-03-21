import { Injectable, signal, computed, effect, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ThemeSettings {
  primaryColor: string;
  gradientIntensity: number;
  animationIntensity: number;
}

export interface ColorPreset {
  name: string;
  value: string;
  isDark: boolean;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'st_theme_settings';
  
  // Default: premium blue and white feel
  settings = signal<ThemeSettings>({
    primaryColor: '#3b82f6', // Premium Blue
    gradientIntensity: 0.15,
    animationIntensity: 1.0
  });

  // Computed signals
  primaryColor = computed(() => this.settings().primaryColor);
  gradientIntensity = computed(() => this.settings().gradientIntensity);
  animationIntensity = computed(() => this.settings().animationIntensity);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadSettings();

    // Reactively update CSS variables
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.applyTheme(this.settings());
    });
  }

  updateSettings(newSettings: Partial<ThemeSettings>) {
    this.settings.update(s => ({ ...s, ...newSettings }));
    this.saveSettings();
  }

  setPrimaryColor(preset: ColorPreset) {
    this.updateSettings({ primaryColor: preset.value });
  }

  setGradientIntensity(value: number) {
    this.updateSettings({ gradientIntensity: value });
  }

  setAnimationIntensity(value: number) {
    this.updateSettings({ animationIntensity: value });
  }

  private applyTheme(s: ThemeSettings) {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement;
    
    // Core color
    root.style.setProperty('--accent', s.primaryColor);
    root.style.setProperty('--accent-hover', this.adjustColor(s.primaryColor, 20));
    root.style.setProperty('--accent-dim', `${s.primaryColor}1f`); // ~12% opacity
    root.style.setProperty('--accent-glow', `${s.primaryColor}40`); // ~25% opacity
    
    // Animation factor
    root.style.setProperty('--motion-factor', s.animationIntensity.toString());
    
    // Background gradient logic (subtle)
    const gColor = this.adjustColor(s.primaryColor, -40);
    root.style.setProperty('--bg-gradient', `radial-gradient(circle at 0% 0%, ${s.primaryColor}${Math.floor(s.gradientIntensity * 100)}, transparent 50%)`);
  }

  private loadSettings() {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved) {
      try {
        this.settings.set(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing theme settings', e);
      }
    }
  }

  private saveSettings() {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.THEME_KEY, JSON.stringify(this.settings()));
  }

  // Helper to lighten/darken hex colors
  private adjustColor(color: string, amount: number): string {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2));
  }
}
