import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service'; 

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmService);
}
