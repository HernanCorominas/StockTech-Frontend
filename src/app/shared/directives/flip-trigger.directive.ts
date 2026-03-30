import { Directive, ElementRef, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { FlipAnimationService } from '../../core/services/flip-animation.service';

/**
 * Standardized FlipTriggerDirective
 * Selector: [appFlipTrigger]
 * Responsiblity: Register elements with the FlipAnimationService and set data-flip-id.
 */
@Directive({
  selector: '[appFlipTrigger]',
  standalone: true
})
export class FlipTriggerDirective implements OnInit, OnDestroy {
  @Input('appFlipTrigger') flipId!: string;

  private el = inject(ElementRef);
  private anime = inject(FlipAnimationService);

  ngOnInit() {
    if (this.flipId) {
      // OBLIGATORY: Assign data-flip-id for GSAP plugin to identify shared elements
      this.el.nativeElement.setAttribute('data-flip-id', this.flipId);
      this.anime.registerSharedElement(this.flipId, this.el.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.flipId) {
      this.anime.unregisterSharedElement(this.flipId);
    }
  }
}
