import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private _permission = '';
  private _hasView = false;
  
  private templateRef = inject(TemplateRef);
  private vcr = inject(ViewContainerRef);
  private authState = inject(AuthStateService);

  @Input() set appHasPermission(val: string) {
    this._permission = val;
    this.updateView();
  }

  constructor() {
    effect(() => {
      // Re-evaluate when permissions signal changes
      this.authState.permissions(); 
      this.updateView();
    });
  }

  private updateView() {
    const permissions = this.authState.permissions();
    const hasPermission = permissions.includes(this._permission) || permissions.includes('admin:*');

    if (hasPermission && !this._hasView) {
      this.vcr.createEmbeddedView(this.templateRef);
      this._hasView = true;
    } else if (!hasPermission && this._hasView) {
      this.vcr.clear();
      this._hasView = false;
    }
  }
}
