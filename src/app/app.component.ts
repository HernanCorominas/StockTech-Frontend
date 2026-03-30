import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppearanceDialogComponent } from './shared/components/appearance-dialog/appearance-dialog.component';
import { ToastContainerComponent } from './core/components/toast-container/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppearanceDialogComponent, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}
