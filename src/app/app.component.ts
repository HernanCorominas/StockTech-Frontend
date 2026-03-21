import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppearanceDialogComponent } from './shared/components/appearance-dialog/appearance-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppearanceDialogComponent],
  template: `
    <router-outlet />
    <app-appearance-dialog />
  `
})
export class AppComponent {}
