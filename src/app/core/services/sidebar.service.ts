import { Injectable, signal, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // We can store a TemplateRef or just a list of actions
  // For simplicity and maximum control, we'll store a list of action objects
  private _actions = signal<SidebarAction[]>([]);
  public actions = this._actions.asReadonly();

  private _template = signal<TemplateRef<any> | null>(null);
  public template = this._template.asReadonly();

  setActions(actions: SidebarAction[]) {
    this._actions.set(actions);
    this._template.set(null);
  }

  setTemplate(template: TemplateRef<any>) {
    this._template.set(template);
    this._actions.set([]);
  }

  clear() {
    this._actions.set([]);
    this._template.set(null);
  }
}

export interface SidebarAction {
  label: string;
  icon?: string;
  handler: () => void;
  class?: string;
  primary?: boolean;
}
