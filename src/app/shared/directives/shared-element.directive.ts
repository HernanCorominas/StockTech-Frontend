import { Directive, ElementRef, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { AnimationService } from '../../core/services/animation.service';

@Directive({
  selector: '[appSharedElement]',
  standalone: true
})
export class SharedElementDirective implements OnInit, OnDestroy {
  @Input('appSharedElement') flipId!: string;

  private el = inject(ElementRef);
  private anime = inject(AnimationService);

  ngOnInit() {
    if (this.flipId) {
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
