import { Injectable, inject } from '@angular/core';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ThemeService } from './theme.service';

gsap.registerPlugin(Flip);

/**
 * Standardized FlipAnimationService
 * Responsible for Managing FLIP transitions across the application.
 * Follows the "Apple-grade" motion specification.
 */
@Injectable({ providedIn: 'root' })
export class FlipAnimationService {
  private theme = inject(ThemeService);

  // Motion standard: GSAP Power2 for smooth acceleration/deceleration
  private readonly defaultEase = 'power2.inOut';
  private readonly appleEase = 'expo.out';
  private readonly organicSpring = 'back.out(1.2)';

  private get factor() {
    return this.theme.settings().animationIntensity;
  }

  private sharedElements = new Map<string, HTMLElement>();

  registerSharedElement(id: string, el: HTMLElement) {
    this.sharedElements.set(id, el);
  }

  unregisterSharedElement(id: string) {
    this.sharedElements.delete(id);
  }

  /**
   * Captures the state of registered shared elements or a specific target.
   */
  getState(targets?: HTMLElement | HTMLElement[] | string) {
    if (this.factor <= 0) return null;
    const elementsToCapture = targets || Array.from(this.sharedElements.values());
    return Flip.getState(elementsToCapture, { 
      props: 'borderRadius,boxShadow,backgroundColor',
      simple: true 
    });
  }

  /**
   * Refined Flip execution: ONLY handles layout geometry.
   * scale: false prevents conflict with animateModal.
   */
  from(state: any, options: any = {}) {
    if (!state || this.factor <= 0) return;
    
    // Unified duration for Flip and Modal expansion
    const duration = (options.duration || 0.3) * this.factor;
    const ease = options.ease || this.appleEase;
    
    return Flip.from(state, {
      duration: duration,
      ease: ease,
      absolute: true,
      scale: false, // Decoupled to allow GSAP (animateModal) to handle scale without flicker
      zIndex: 1000,
      onStart: (elements) => {
        // Advanced interpolation: Circle (Button) -> Rounded Card (Header)
        gsap.fromTo(elements, 
          { borderRadius: options.fromRadius || '50%', padding: '0px' },
          { 
            borderRadius: options.borderRadius || '20px', 
            padding: '16px', 
            duration: duration, 
            ease: 'power2.inOut' 
          }
        );
        if (options.onStart) options.onStart(elements);
      },
      onComplete: options.onComplete
    });
  }

  /**
  private readonly appleEase = 'expo.out';
  private readonly organicSpring = 'elastic.out(1, 0.75)';

  /**
   * Premium Expansion entry for modals (iOS App Opening style).
   * Features a fluid expansion and high-fidelity spring easing.
   */
  animateModal(element: HTMLElement, triggerRect?: DOMRect) {
    if (this.factor <= 0 || !element) return;

    const fromScale = 0.5;
    const fromOpacity = 0;
    
    // If we have trigger coordinates, we can make it morph from there
    if (triggerRect) {
      const elRect = element.getBoundingClientRect();
      const centerX = triggerRect.left + triggerRect.width / 2;
      const centerY = triggerRect.top + triggerRect.height / 2;
      
      gsap.set(element, {
        x: centerX - (elRect.left + elRect.width / 2),
        y: centerY - (elRect.top + elRect.height / 2),
        scale: 0.1,
        opacity: 0,
        borderRadius: '50px'
      });
    }

    return gsap.to(element, {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      borderRadius: '24px',
      duration: 0.6 * this.factor,
      ease: 'back.out(1.1)', // Subtle bounce like iOS
      clearProps: 'transform,borderRadius'
    });
  }

  /**
   * Simple Fade + Scale exit for modals.
   */
  /**
   * Clean Unified Content Reveal.
   * Removed staggering as requested to maintain high-speed UX.
   */
  animateContent(container: HTMLElement, selector: string = '.inline-form-panel__body') {
    const element = container.querySelector(selector) as HTMLElement;
    if (!element || this.factor <= 0) return;

    return gsap.fromTo(element,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.2 * this.factor, // Faster fade
        ease: 'power1.out'
      }
    );
  }

  animateModalOut(element: HTMLElement) {
    if (this.factor <= 0 || !element) return;

    return gsap.to(element, {
      opacity: 0,
      scale: 0.95,
      duration: 0.2 * this.factor,
      ease: 'power2.in'
    });
  }

  /**
   * Stagger removed completely to avoid visual lag.
   */
  staggerFormElements(container: HTMLElement) {
    return;
  }

  /**
   * Simplified Stagger for lists.
   */
  staggerIn(elements: any, stagger: number = 0.05) {
    if (this.factor <= 0) return;
    return gsap.fromTo(elements, 
      { opacity: 0, scale: 0.98 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.3 * this.factor, 
        stagger: stagger * this.factor, 
        ease: 'power2.out'
      }
    );
  }

  /**
   * Simplified Fade In for overlays.
   */
  fadeIn(element: any) {
    if (this.factor <= 0 || !element) return;

    return gsap.fromTo(element,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.3 * this.factor, 
        ease: 'power1.out' 
      }
    );
  }

  /**
   * Simplified Fade Out for overlays.
   */
  fadeOut(element: any) {
    if (this.factor <= 0 || !element) return;

    return gsap.to(element, {
      opacity: 0,
      duration: 0.3 * this.factor,
      ease: 'power1.in'
    });
  }

  /**
   * Button rotation is removed to avoid unnecessary visual distraction.
   */
  rotateButton(element: Element, active: boolean) {
    return;
  }

  /**
   * Simplified Page transition.
   */
  pageTransition(element: HTMLElement) {
    if (this.factor <= 0) return;
    gsap.fromTo(element,
      { opacity: 0, scale: 0.99 },
      { opacity: 1, scale: 1, duration: 0.2 * this.factor, ease: 'power2.out' }
    );
  }
}
