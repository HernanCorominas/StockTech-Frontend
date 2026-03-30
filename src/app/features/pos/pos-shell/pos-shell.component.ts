import { Component, OnInit, OnDestroy, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductGridComponent } from '../product-grid/product-grid.component';
import { CartPanelComponent } from '../cart-panel/cart-panel.component';
import { CheckoutModalComponent } from '../checkout-modal/checkout-modal.component';
import { ClientSelectorComponent } from '../client-selector/client-selector.component';
import { ApiService } from '../../../core/services/api.service';
import { BranchStateService } from '../../../core/services/branch-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, Client } from '../../../core/models';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

export interface CartItem {
  product: Product;
  quantity: number;
  lineTotal: number;
}

@Component({
  selector: 'app-pos-shell',
  standalone: true,
  imports: [CommonModule, ProductGridComponent, CartPanelComponent, CheckoutModalComponent, ClientSelectorComponent],
  templateUrl: './pos-shell.component.html',
  styleUrl: './pos-shell.component.scss'
})
export class PosShellComponent implements OnInit, OnDestroy {
  api = inject(ApiService);
  branchState = inject(BranchStateService);
  toast = inject(ToastService);

  // Data
  products = signal<Product[]>([]);
  clients = signal<Client[]>([]);
  
  // State
  loading = signal(true);
  cart = signal<CartItem[]>([]);
  showCheckout = signal(false);
  isExpressClient = signal(true);
  selectedClient = signal<Client | null>(null);
  expressName = signal('');
  expressDocument = signal('');
  
  // Computed
  subtotal = signal(0);
  taxRate = signal(0.18); // Default, update via settings if needed
  
  private sub = new Subscription();

  constructor() {
    this.sub.add(
      toObservable(this.branchState.selectedBranchId).subscribe(() => this.loadData())
    );
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  loadData() {
    this.loading.set(true);
    let branchId = this.branchState.selectedBranchId() ?? undefined;
    
    // Quick fork/join or sequential is fine
    this.api.getProducts(1, 1000).subscribe(res => {
      this.products.set(res.items);
      this.loading.set(false);
    });

    this.api.getClients().subscribe(c => {
       // getClients returns an array
       this.clients.set(Array.isArray(c) ? c : (c as any).items || []);
    });

    this.api.getSystemSettings().subscribe(settings => {
      const taxRateSetting = settings.find(s => s.key === 'DefaultTaxRate');
      if (taxRateSetting) this.taxRate.set(parseFloat(taxRateSetting.value) / 100);
      else this.taxRate.set(0.18);
    });
  }

  // Cart Actions
  addToCart(product: Product) {
    if (product.stock <= 0) {
      this.toast.error('Producto sin stock disponible');
      return;
    }

    this.cart.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
           this.toast.error('Stock insuficiente');
           return items;
        }
        existing.quantity++;
        existing.lineTotal = existing.quantity * existing.product.price;
        return [...items];
      }
      return [...items, { product, quantity: 1, lineTotal: product.price }];
    });
    this.recalculateTotals();
  }

  updateQuantity(item: CartItem, newQty: number) {
    if (newQty <= 0) {
      this.removeFromCart(item);
      return;
    }
    if (newQty > item.product.stock) {
      this.toast.error('Stock insuficiente');
      return;
    }
    
    this.cart.update(items => {
      const i = items.find(x => x.product.id === item.product.id);
      if (i) {
        i.quantity = newQty;
        i.lineTotal = i.quantity * i.product.price;
      }
      return [...items];
    });
    this.recalculateTotals();
  }

  removeFromCart(item: CartItem) {
    this.cart.update(items => items.filter(i => i.product.id !== item.product.id));
    this.recalculateTotals();
  }

  clearCart() {
    this.cart.set([]);
    this.recalculateTotals();
  }

  recalculateTotals() {
    const sum = this.cart().reduce((acc, item) => acc + item.lineTotal, 0);
    this.subtotal.set(sum);
  }

  // Keyboard Shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault();
      this.isExpressClient.set(true);
    } else if (event.key === 'F3') {
      event.preventDefault();
      this.isExpressClient.set(false);
    } else if (event.key === 'Escape') {
      // If modal is open, close it. Otherwise clear cart.
      if (this.showCheckout()) {
         this.showCheckout.set(false);
      } else {
         this.clearCart();
      }
    } else if (event.key === 'Enter') {
      // If not in an input, and cart has items, trigger checkout
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (this.cart().length > 0 && !this.showCheckout()) {
         this.showCheckout.set(true);
      }
    }
  }
}
