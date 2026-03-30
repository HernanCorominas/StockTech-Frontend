import { Component, OnInit, Output, EventEmitter, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ManualStockAdjustment } from '../../../../core/services/api.service';
import { Product, ProductVariant, TransactionType } from '../../../../core/models';
import { BranchStateService } from '../../../../core/services/branch-state.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-adjustment.component.html',
  styleUrls: ['./stock-adjustment.component.scss']
})
export class StockAdjustmentComponent implements OnInit {
  @Input() isActive = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  private api = inject(ApiService);
  private branchState = inject(BranchStateService);
  private toast = inject(ToastService);

  TransactionType = TransactionType;

  products: Product[] = [];
  variants: ProductVariant[] = [];
  
  saving = false;
  showErrors = false;
  error = '';
  
  selectedProductId = '';
  selectedVariantId = '';
  movementType: TransactionType = TransactionType.Adjustment;
  quantity: number = 0;
  referenceNumber = '';
  currentStock = 0;

  ngOnInit(): void {
    this.api.getProducts(1, 100).subscribe({
      next: (res) => this.products = res.items
    });
  }

  onProductChange(): void {
    const product = this.products.find(p => p.id === this.selectedProductId);
    this.currentStock = product?.stock ?? 0;
    this.selectedVariantId = '';
    this.variants = [];

    if (this.selectedProductId) {
      this.api.getProductVariants(this.selectedProductId).subscribe({
        next: (v) => this.variants = v,
        error: () => this.variants = []
      });
    }
  }

  save(): void {
    this.showErrors = true;
    if (!this.selectedProductId || !this.quantity) return;
    this.saving = true;
    this.error = '';

    const data: ManualStockAdjustment = {
      productId: this.selectedProductId,
      variantId: this.selectedVariantId || undefined,
      quantity: this.quantity,
      type: this.movementType,
      referenceNumber: this.referenceNumber || undefined,
      branchId: this.branchState.selectedBranchId() ?? undefined,
    };

    this.api.createStockAdjustment(data).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Movimiento de stock registrado correctamente');
        this.onSaved.emit();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Error al registrar el movimiento';
      }
    });
  }
}
