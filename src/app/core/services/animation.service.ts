import { Injectable, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ThemeService } from './theme.service';

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private theme = inject(ThemeService);

  // iOS-Style Spring Easing
  private readonly springEase = 'back.out(1.4)';
  private readonly bounceEase = 'elastic.out(1, 0.75)';

  private get factor() {
    return this.theme.settings().animationIntensity;
  }

  /**
   * Animates with a premium "iPhone-style" slide-up and scale.
   */
  fadeIn(element: any, delay: number = 0) {
    return gsap.from(element, { 
      opacity: 0, 
      y: 30, 
      scale: 0.98,
      filter: 'blur(4px)',
      duration: 0.7 * this.factor, 
      delay, 
      ease: this.springEase 
    });
  }

  /**
   * Staggered entry with physical rebound.
   */
  staggerIn(elements: any, stagger: number = 0.08) {
    return gsap.from(elements, { 
      opacity: 0, 
      y: 40, 
      scale: 0.95,
      duration: 0.6 * this.factor, 
      stagger: stagger * this.factor, 
      ease: this.springEase,
      clearProps: 'all'
    });
  }

  /**
   * Fluid modal entrance with scale bounce.
   */
  modalIn(element: any) {
    const tl = gsap.timeline();
    tl.from(element, { 
      scale: 0.9, 
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.5 * this.factor, 
      ease: this.bounceEase
    });
    return tl;
  }

  /**
   * Hover feedback with soft spring.
   */
  pulse(element: any) {
    return gsap.to(element, { 
      scale: 1.02, 
      duration: 0.2, 
      yoyo: true, 
      repeat: 1, 
      ease: 'sine.inOut' 
    });
  }

  /**
   * Route transition (horizontal slide with blur).
   */
  pageTransition(element: any) {
    return gsap.fromTo(element, 
      { opacity: 0, x: 20, filter: 'blur(5px)' },
      { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.5 * this.factor, ease: this.springEase }
    );
  }
}
