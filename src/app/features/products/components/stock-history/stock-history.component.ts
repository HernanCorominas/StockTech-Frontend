import { Component, Input, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { InventoryTransaction } from '../../../../core/models';
import { FormsModule } from '@angular/forms';
import { FilterPanelComponent, FilterOption } from '../../../../shared/components/filter-panel/filter-panel.component';
import { FilterChipsComponent, ActiveFilter } from '../../../../shared/components/filter-chips/filter-chips.component';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPanelComponent, FilterChipsComponent],
  templateUrl: './stock-history.component.html',
  styleUrls: ['./stock-history.component.scss']
})
export class StockHistoryComponent implements OnInit {
  @Input() productId!: string;
  @Input() productName: string = 'Producto';
  @Output() close = new EventEmitter<void>();
  
  movements: InventoryTransaction[] = [];
  loading = true;

  showFilterPanel = false;
  filterConfig: FilterOption[] = [];
  activeChips: ActiveFilter[] = [];
  filters: any = {};
  
  private productService = inject(ProductService);

  ngOnInit(): void {
    this.initFilterConfig();
    this.loadMovements();
  }

  initFilterConfig() {
    this.filterConfig = [
      {
        id: 'type',
        label: 'Tipo de Movimiento',
        type: 'select',
        options: [
          { value: 1, label: 'Entrada Compra' },
          { value: 2, label: 'Salida Venta' },
          { value: 3, label: 'Ajuste Negativo' },
          { value: 4, label: 'Ajuste Positivo' }
        ]
      },
      { id: 'startDate', label: 'Desde', type: 'date' },
      { id: 'endDate', label: 'Hasta', type: 'date' }
    ];
  }

  loadMovements(): void {
    this.loading = true;
    const params = { productId: this.productId, ...this.filters };
    this.productService.getTransactions(params).subscribe({
      next: (res) => {
        this.movements = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters(newFilters: any) {
    this.filters = { ...newFilters };
    this.updateActiveChips();
    this.loadMovements();
  }

  updateActiveChips() {
    this.activeChips = [];
    Object.keys(this.filters).forEach(key => {
      const config = this.filterConfig.find(f => f.id === key);
      const val = this.filters[key];
      if (config && val) {
        let displayValue = val.toString();
        if (config.type === 'select') {
          displayValue = config.options?.find(o => o.value === val)?.label || val;
        }
        this.activeChips.push({ id: key, label: config.label, displayValue: displayValue });
      }
    });
  }

  removeFilter(id: string) {
    delete this.filters[id];
    const config = this.filterConfig.find(f => f.id === id);
    if (config) config.value = undefined;
    this.updateActiveChips();
    this.loadMovements();
  }

  clearFilters() {
    this.filters = {};
    this.filterConfig.forEach(f => f.value = undefined);
    this.activeChips = [];
    this.loadMovements();
  }

  getTypeName(type: number): string {
    switch(type) {
      case 1: return 'Compra';
      case 2: return 'Venta';
      case 3: return 'Ajuste';
      case 4: return 'Transferencia';
      default: return 'Otro';
    }
  }

  getTypeClass(type: number): string {
    switch(type) {
      case 1: return 'badge-purchase';
      case 2: return 'badge-sale';
      case 3: return 'badge-adj';
      case 4: return 'badge-trans';
      default: return '';
    }
  }
}
