import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-panel.component.html',
  styleUrl: './cart-panel.component.scss'
})
export class CartPanelComponent {
  @Input() items: any[] = [];
  @Input() subtotal: number = 0;
  @Input() taxRate: number = 0;
  
  @Output() updateQuantity = new EventEmitter<{item: any, quantity: number}>();
  @Output() remove = new EventEmitter<any>();
  @Output() clear = new EventEmitter<void>();

  get taxAmount() {
    return this.subtotal * this.taxRate;
  }

  get totalAmount() {
    return this.subtotal + this.taxAmount;
  }
}
