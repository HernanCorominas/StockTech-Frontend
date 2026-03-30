import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { InventoryTransaction, TransactionType, Product } from '../../../../core/models';
import { BranchStateService } from '../../../../core/services/branch-state.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-movements.component.html',
  styleUrls: ['./stock-movements.component.scss']
})
export class StockMovementsComponent implements OnInit {
  private api = inject(ApiService);
  public branchState = inject(BranchStateService);
  
  TransactionType = TransactionType;
  movements: InventoryTransaction[] = [];
  products: Product[] = [];
  loading = true;

  filters = {
    productId: '',
    type: ''
  };

  constructor() {
    toObservable(this.branchState.selectedBranchId).subscribe(() => {
      this.load();
    });
  }

  ngOnInit(): void {
    this.api.getProducts(1, 100).subscribe(res => this.products = res.items);
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getInventoryTransactions(
      this.branchState.selectedBranchId() || undefined,
      this.filters.productId || undefined
    ).subscribe({
      next: (res) => {
        // Simple client-side type filtering for now if backend doesn't support it directly
        let filtered = res;
        if (this.filters.type) {
           filtered = res.filter(m => m.type === parseInt(this.filters.type));
        }
        this.movements = filtered;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  resetFilters() {
    this.filters = { productId: '', type: '' };
    this.load();
  }

  getProductName(id: string): string {
    return this.products.find(p => p.id === id)?.name || id;
  }

  getTypeName(type: number): string {
    switch (type) {
      case TransactionType.Purchase: return 'Entrada';
      case TransactionType.Sale: return 'Venta';
      case TransactionType.Adjustment: return 'Ajuste';
      case TransactionType.Transfer: return 'Traslado';
      default: return 'Otro';
    }
  }
}
