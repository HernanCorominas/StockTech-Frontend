import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/models';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail-modal.component.html',
  styleUrls: ['./product-detail-modal.component.scss']
})
export class ProductDetailModalComponent {
  @Input({ required: true }) product!: Product;
  @Output() onClose = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<void>();

  get isLowStock(): boolean {
    return this.product.stock <= this.product.minStock;
  }
}
