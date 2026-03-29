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
  template: `
  <div class="page-header">
    <div>
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Módulo de Inventario</p>
      <p class="text-muted small">Mostrando {{ totalCount }} activos en sistema</p>
    </div>
    <div style="display: flex; gap: 8px; align-items: center">
      <div class="search-input">
        <input type="text" placeholder="Buscar por SKU o nombre..." [(ngModel)]="search" (keyup.enter)="load(1)" />
      </div>
      <button class="btn btn--secondary btn--sm" (click)="showFilterPanel = true">
        <span class="mr-2">🔍</span> Filtros
      </button>
      <button *ngIf="!isSeller" class="btn btn--secondary btn--sm" (click)="openBulkEdit()" [appFlipTrigger]="'btn-bulk-product'">Ajuste</button>
    </div>
  </div>

  <app-filter-chips [chips]="activeChips" (remove)="removeFilter($event)" (clearAll)="clearFilters()"></app-filter-chips>

  <div *ngIf="loading" class="spinner"></div>

  <div class="card overflow-hidden" *ngIf="!loading">
    <table class="data-table">
      <thead>
        <tr>
          <th width="60"></th>
          <th>Producto / Categoría</th>
          <th width="120">SKU</th>
          <th width="150">Valuación</th>
          <th width="140">Existencias</th>
          <th width="160">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of products" #row [appFlipTrigger]="'product-row-' + p.id" 
            class="hover:bg-[var(--bg-secondary)] transition-all cursor-pointer group" (click)="openDetail(p)">
          <td>
            <div class="w-9 h-9 rounded-xl overflow-hidden bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-subtle)] group-hover:scale-105 transition-transform duration-300">
              <img *ngIf="p.image" [src]="p.image" class="w-full h-full object-cover" alt="" />
              <span *ngIf="!p.image" class="text-lg opacity-40">📦</span>
            </div>
          </td>
          <td class="py-2">
            <div class="font-black text-primary group-hover:text-accent transition-colors leading-tight">{{ p.name }}</div>
            <div class="text-[9px] text-muted font-bold uppercase tracking-widest">{{ p.categoryName || 'General' }}</div>
          </td>
          <td>
            <span class="font-mono text-muted text-[10px] font-black tracking-tighter bg-[var(--bg-secondary)] py-1 px-2 rounded-lg border border-[var(--border-subtle)]">
              {{ p.sku || 'PENDIENTE' }}
            </span>
          </td>
          <td>
            <div class="text-primary font-black text-sm">RD$ {{ p.price | number:'1.2-2' }}</div>
            <div class="text-[9px] text-muted font-bold uppercase tracking-wide">Costo: {{ p.cost | number:'1.2-2' }}</div>
          </td>
          <td>
            <div class="flex items-center gap-2">
               <span class="badge" 
                 [class.badge--danger]="p.stock <= 5" 
                 [class.badge--warning]="p.stock > 5 && p.stock <= 15" 
                 [class.badge--success]="p.stock > 15">
                 {{ p.stock }} uni.
               </span>
               <span class="text-[10px] font-black uppercase" 
                 [class.text-danger]="p.stock <= 5"
                 [class.text-warning]="p.stock > 5 && p.stock <= 15"
                 [class.text-success]="p.stock > 15">
                 {{ p.stock <= 5 ? 'Crítico' : p.stock <= 15 ? 'Bajo' : 'Óptimo' }}
               </span>
            </div>
          </td>
          <td>
            <div class="flex gap-2">
               <button *ngIf="isAdmin || isManager" class="btn btn--secondary btn--sm" (click)="onEdit.emit(p); $event.stopPropagation()" [appFlipTrigger]="'product-action'">Editar</button>
               <button class="btn btn--accent btn--sm" (click)="openKardex(p); $event.stopPropagation()" [appFlipTrigger]="'btn-kardex-' + p.id">Historial</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="pagination flex-between p-4 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
      <span class="text-muted text-xs font-bold uppercase tracking-widest">Mostrando {{ products.length }} de {{ totalCount }} registros</span>
      <div class="flex gap-2">
        <button class="btn btn--secondary btn--sm" [disabled]="page === 1" (click)="load(page - 1)">Anterior</button>
        <button class="btn btn--secondary btn--sm" [disabled]="products.length < pageSize" (click)="load(page + 1)">Siguiente</button>
      </div>
    </div>
  </div>

  <!-- Kardex Panel (Arctic) -->
  <div class="overlay" [class.active]="showKardexModal" (click)="closeKardex()"></div>
  <div class="inline-form-panel" [class.active]="showKardexModal" *ngIf="showKardexModal" [appFlipTrigger]="'btn-kardex-' + selectedProductId">
    <div class="inline-form-panel__header">
      <div>
        <h3 class="font-black text-primary">Libro de Kardex</h3>
        <p class="text-muted small">Cronología de existencias: <span class="font-bold text-primary">{{ selectedProductName }}</span></p>
      </div>
      <button class="btn btn--ghost btn--sm" (click)="closeKardex()">✕</button>
    </div>
    <div class="inline-form-panel__body bg-[var(--bg-primary)] p-0">
      <app-stock-history [productId]="selectedProductId"></app-stock-history>
    </div>
  </div>

  <!-- Bulk Edit Panel -->
  <div class="inline-form-panel" *ngIf="showBulkEditModal" [appFlipTrigger]="'btn-bulk-product'">
    <div class="inline-form-panel__header">
      <h3>Ajuste Masivo de Stock</h3>
      <button class="btn btn--ghost btn--sm" (click)="closeBulkEdit()">✕</button>
    </div>
    <div class="inline-form-panel__body">
      <table class="data-table">
          <thead><tr><th>Producto</th><th>Stock Actual</th><th>Nuevo Stock</th></tr></thead>
          <tbody>
              <tr *ngFor="let p of bulkEditProducts">
                  <td class="fw-semibold">{{ p.name }}</td>
                  <td class="text-muted">{{ p.originalStock }}</td>
                  <td><input type="number" class="form-control" style="width: 80px" [(ngModel)]="p.newStock" /></td>
              </tr>
          </tbody>
      </table>
    </div>
    <div class="inline-form-panel__footer">
      <button class="btn btn--secondary" (click)="closeBulkEdit()">Cancelar</button>
      <button class="btn btn--primary" (click)="saveBulkEdit()" [disabled]="savingBulk">
          {{ savingBulk ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
    </div>
  </div>
  <!-- Dynamic Filter Panel -->
  <app-filter-panel
    [isVisible]="showFilterPanel"
    [filters]="filterConfig"
    (onApply)="applyFilters($event)"
    (onClear)="clearFilters()"
    (onClose)="showFilterPanel = false">
  </app-filter-panel>

  <!-- Product Detail Modal -->
  <app-product-detail-modal 
    *ngIf="showDetailModal && selectedProduct" 
    [product]="selectedProduct"
    (onClose)="closeDetail()"
    (onEdit)="editFromDetail()">
  </app-product-detail-modal>
  `
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
    const queryFilters = { ...this.filters, branchId: this.branchState.selectedBranchId() };
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
