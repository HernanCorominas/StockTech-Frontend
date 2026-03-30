import { Component, OnInit, EventEmitter, Output, ViewChildren, QueryList, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ApiService } from '../../../../core/services/api.service';
import { FlipAnimationService } from '../../../../core/services/flip-animation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { BranchStateService } from '../../../../core/services/branch-state.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Product, InventoryTransaction } from '../../../../core/models';
import { FlipTriggerDirective } from '../../../../shared/directives/flip-trigger.directive';
import { toObservable } from '@angular/core/rxjs-interop';
import { StockHistoryComponent } from '../../components/stock-history/stock-history.component';
import { ProductDetailModalComponent } from '../../components/product-detail-modal/product-detail-modal.component';
import { FilterPanelComponent, FilterOption } from '../../../../shared/components/filter-panel/filter-panel.component';
import { FilterChipsComponent, ActiveFilter } from '../../../../shared/components/filter-chips/filter-chips.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FlipTriggerDirective, 
    StockHistoryComponent, 
    ProductDetailModalComponent,
    FilterPanelComponent,
    FilterChipsComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  @Output() onCreate = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<Product>();
  @ViewChildren('row') rows!: QueryList<ElementRef>;

  private api = inject(ApiService);
  private productService = inject(ProductService);
  private authState = inject(AuthStateService);
  private anime = inject(FlipAnimationService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private categoryService = inject(CategoryService);
  public branchState = inject(BranchStateService);

  isAdmin = this.authState.isAdmin();
  isManager = this.authState.isManager();
  isSeller = this.authState.isSeller();

  products: Product[] = [];
  loading = true;
  page = 1;
  pageSize = 10;
  search = '';
  totalCount = 0;

  showKardexModal = false;
  selectedProductName = '';
  selectedProductId = '';
  kardexEntries: InventoryTransaction[] = [];

  showBulkEditModal = false;
  bulkEditProducts: any[] = [];
  savingBulk = false;

  showFilterPanel = false;
  filters: any = {};
  categories: any[] = [];
  filterConfig: FilterOption[] = [];
  activeChips: ActiveFilter[] = [];

  showDetailModal = false;
  selectedProduct: Product | null = null;

  constructor() {
    // Reactively re-load when branch changes
    toObservable(this.branchState.selectedBranchId).subscribe(() => {
      this.load(1);
    });
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(res => {
      this.categories = res;
      this.initFilterConfig();
    });
  }

  initFilterConfig() {
    this.filterConfig = [
      {
        id: 'categoryId',
        label: 'Categoría',
        type: 'checkbox',
        options: this.categories.map(c => ({ value: c.id, label: c.name })),
        value: []
      },
      {
        id: 'minPrice',
        label: 'Precio Mínimo',
        type: 'range',
        min: 0,
        max: 50000,
        value: 0
      },
      {
        id: 'stockStatus',
        label: 'Estado de Stock',
        type: 'select',
        options: [
          { value: 'critico', label: 'Crítico (<= 5)' },
          { value: 'bajo', label: 'Bajo (6 - 15)' },
          { value: 'normal', label: 'Normal (+15)' }
        ]
      }
    ];

    // Admin can filter by branch
    if (this.isAdmin) {
      (this.api as any).getBranches().subscribe((branches: any) => {
        this.filterConfig.unshift({
          id: 'branchId',
          label: 'Sucursal',
          type: 'select',
          options: branches.map((b: any) => ({ value: b.id, label: b.name })),
          value: this.branchState.selectedBranchId()
        });
      });
    }
  }

  load(pageIndex?: number): void {
    if (pageIndex) this.page = pageIndex;
    this.loading = true;
    const queryFilters = { branchId: this.branchState.selectedBranchId(), ...this.filters };
    this.productService.getProducts(this.page, this.pageSize, this.search, queryFilters).subscribe({
      next: (res) => {
        this.products = res.items;
        this.totalCount = res.totalCount;
        this.loading = false;
        setTimeout(() => {
          this.anime.staggerIn(this.rows.map(r => r.nativeElement));
        }, 0);
      },
      error: () => this.loading = false
    });
  }

  applyFilters(newFilters: any) {
    this.filters = { ...newFilters };
    this.updateActiveChips();
    this.load(1);
  }

  updateActiveChips() {
    this.activeChips = [];
    Object.keys(this.filters).forEach(key => {
      const config = this.filterConfig.find(f => f.id === key);
      const val = this.filters[key];
      
      if (config && val) {
        let displayValue = val.toString();
        if (config.type === 'checkbox' && Array.isArray(val)) {
          displayValue = val.length === 1 
            ? config.options?.find(o => o.value === val[0])?.label || val[0]
            : `${val.length} seleccionados`;
        } else if (config.type === 'select') {
          displayValue = config.options?.find(o => o.value === val)?.label || val;
        }

        this.activeChips.push({
          id: key,
          label: config.label,
          displayValue: displayValue
        });
      }
    });
  }

  removeFilter(id: string) {
    delete this.filters[id];
    const config = this.filterConfig.find(f => f.id === id);
    if (config) config.value = Array.isArray(config.value) ? [] : undefined;
    this.updateActiveChips();
    this.load(1);
  }

  clearFilters() {
    this.filters = {};
    this.filterConfig.forEach(f => f.value = Array.isArray(f.value) ? [] : undefined);
    this.activeChips = [];
    this.load(1);
  }

  openKardex(p: Product): void {
    const state = this.anime.getState('[data-flip-id="btn-kardex-' + p.id + '"]');
    this.selectedProductName = p.name;
    this.selectedProductId = p.id;
    this.showKardexModal = true;
    setTimeout(() => this.anime.from(state));
  }

  closeKardex(): void {
    const state = this.anime.getState('[data-flip-id="btn-kardex-' + this.selectedProductId + '"]');
    this.showKardexModal = false;
    setTimeout(() => this.anime.from(state));
  }

  openBulkEdit(): void {
    if (this.products.length === 0) return;
    const state = this.anime.getState('[data-flip-id="btn-bulk-product"]');
    this.bulkEditProducts = this.products.map(p => ({
      productId: p.id,
      name: p.name,
      originalStock: p.stock,
      newStock: p.stock
    }));
    this.showBulkEditModal = true;
    setTimeout(() => this.anime.from(state));
  }

  closeBulkEdit(): void {
    const state = this.anime.getState('[data-flip-id="btn-bulk-product"]');
    this.showBulkEditModal = false;
    setTimeout(() => this.anime.from(state));
  }

  saveBulkEdit(): void {
    // Stock bulk editing has been replaced by the StockAdjustmentComponent flow
    // (accessible via the 'Ajuste de Stock' sidebar action) which properly creates
    // InventoryTransaction records for each movement instead of writing to Product.stock directly.
    this.toast.info('Para ajustar stock, usa el panel \'Ajuste de Stock\' en el sidebar lateral. Cada movimiento queda registrado con su auditoría completa.');
    this.closeBulkEdit();
  }

  async delete(id: string) {
    const ok = await this.confirm.confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (!ok) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.toast.success('Producto eliminado');
        this.load();
      },
      error: (err: any) => this.toast.error('Error al eliminar: ' + (err.error?.message || 'Error desconocido'))
    });
  }

  openDetail(p: Product) {
    this.selectedProduct = p;
    this.showDetailModal = true;
  }

  closeDetail() {
    this.showDetailModal = false;
    this.selectedProduct = null;
  }

  editFromDetail() {
    const p = this.selectedProduct;
    this.closeDetail();
    if (p) this.onEdit.emit(p);
  }
}
