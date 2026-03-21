import { Injectable, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ThemeService } from './theme.service';

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private theme = inject(ThemeService);

  // Apple-grade easing physics
  // expo.out gives that initial burst of speed that softly decelerates
  private readonly appleEase = 'expo.out';
  // back.out provides a very subtle organic overshoot
  private readonly organicSpring = 'back.out(1.2)';
  // fluid transition for things that slide
  private readonly fluidSlide = 'power4.out';

  private get factor() {
    return this.theme.settings().animationIntensity;
  }

  /**
   * Animates with a premium "iPhone-style" slide-up and scale.
   * Perfect for cards or dashboard widgets.
   */
  fadeIn(element: any, delay: number = 0) {
    if (this.factor <= 0) return;
    return gsap.fromTo(element, 
      { opacity: 0, y: 40, scale: 0.96, filter: 'blur(8px)' },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        filter: 'blur(0px)', 
        duration: 0.8 * this.factor, 
        delay: delay * this.factor, 
        ease: this.appleEase 
      }
    );
  }

  /**
   * Staggered entry with physical rebound, ideal for lists or table rows.
   */
  staggerIn(elements: any, stagger: number = 0.06) {
    if (this.factor <= 0) return;
    return gsap.fromTo(elements, 
      { opacity: 0, y: 25, scale: 0.98, filter: 'blur(4px)' },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        filter: 'blur(0px)', 
        duration: 0.75 * this.factor, 
        stagger: stagger * this.factor, 
        ease: this.fluidSlide,
        clearProps: 'filter,transform' // cleanup for performance
      }
    );
  }

  /**
   * Fluid modal entrance with scale bounce simulating an iOS Sheet.
   */
  modalIn(element: any) {
    if (this.factor <= 0) return;
    return gsap.fromTo(element, 
      { scale: 0.85, y: '10%', opacity: 0, filter: 'blur(12px)' },
      { 
        scale: 1, 
        y: '0%', 
        opacity: 1, 
        filter: 'blur(0px)', 
        duration: 0.6 * this.factor, 
        ease: this.organicSpring 
      }
    );
  }

  /**
   * Hover feedback with soft spring. 
   * Useful for interactive cards.
   */
  pulse(element: any) {
    if (this.factor <= 0) return;
    return gsap.to(element, { 
      scale: 1.03, 
      duration: 0.3 * this.factor, 
      ease: 'power2.out',
      yoyo: true, 
      repeat: 1
    });
  }

  /**
   * Application Route transition.
   * Mimics the native app horizontal screen slide with depth blur.
   */
  pageTransition(element: any) {
    if (this.factor <= 0) return;
    return gsap.fromTo(element, 
      { opacity: 0, x: 25, scale: 0.99, filter: 'blur(6px)' },
      { 
        opacity: 1, 
        x: 0, 
        scale: 1, 
        filter: 'blur(0px)', 
        duration: 0.7 * this.factor, 
        ease: this.appleEase,
        clearProps: 'transform,filter'
      }
    );
  }
}

