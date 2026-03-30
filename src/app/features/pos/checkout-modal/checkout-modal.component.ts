import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { BranchStateService } from '../../../core/services/branch-state.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-modal.component.html',
  styleUrl: './checkout-modal.component.scss'
})
export class CheckoutModalComponent {
  api = inject(ApiService);
  toast = inject(ToastService);
  branchState = inject(BranchStateService);

  @Input() cart: any[] = [];
  @Input() subtotal: number = 0;
  @Input() taxRate: number = 0;
  @Input() isExpress: boolean = true;
  @Input() client: Client | null = null;
  @Input() expressName: string = '';
  @Input() expressDocument: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  paymentMethod: 'CASH' | 'CARD' = 'CASH';
  isProcessing = false;

  get taxAmount() { return this.subtotal * this.taxRate; }
  get totalAmount() { return this.subtotal + this.taxAmount; }

  processPayment() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const invoiceData = {
       branchId: this.branchState.selectedBranchId()!,
       clientId: this.isExpress ? null : (this.client?.id || null),
       customerName: this.isExpress ? this.expressName : undefined,
       customerDocument: this.isExpress ? this.expressDocument : undefined,
       paymentMethod: this.paymentMethod,
       taxRate: this.taxRate,
       items: this.cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price
       }))
    };

    this.api.createInvoice(invoiceData)
      .pipe(finalize(() => this.isProcessing = false))
      .subscribe({
         next: () => {
            this.toast.success('Venta procesada exitosamente');
            this.success.emit();
         },
         error: (err) => {
            console.error('Sale error', err);
            this.toast.error('Error al procesar la venta');
         }
      });
  }
}
