import { Injectable } from '@angular/core';
import { gsap } from 'gsap';

@Injectable({ providedIn: 'root' })
export class AnimationService {
  /**
   * Animates a single element with a smooth fade-in and slide-up effect.
   */
  fadeIn(element: any, delay: number = 0) {
    return gsap.from(element, { 
      opacity: 0, 
      y: 20, 
      duration: 0.6, 
      delay, 
      ease: 'power3.out' 
    });
  }

  /**
   * Animates a list of elements with a staggered entry effect.
   */
  staggerIn(elements: any, stagger: number = 0.05) {
    return gsap.from(elements, { 
      opacity: 0, 
      y: 20, 
      duration: 0.5, 
      stagger, 
      ease: 'power3.out' 
    });
  }

  /**
   * Dynamic modal entrance animation.
   */
  modalIn(element: any) {
    const tl = gsap.timeline();
    tl.from(element, { 
      scale: 0.95, 
      opacity: 0, 
      duration: 0.4, 
      ease: 'back.out(1.7)' 
    });
    return tl;
  }

  /**
   * Simple hover-like feedback for buttons or cards.
   */
  pulse(element: any) {
    return gsap.to(element, { 
      scale: 1.05, 
      duration: 0.2, 
      yoyo: true, 
      repeat: 1, 
      ease: 'sine.inOut' 
    });
  }
}
