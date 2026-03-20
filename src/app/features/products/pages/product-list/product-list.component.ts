import { Component, OnInit, EventEmitter, Output, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AnimationService } from '../../../../core/services/animation.service';
import { Product, InventoryTransaction } from '../../../../core/models/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-header" #header>
    <div>
      <h1>Inventario</h1>
      <p>{{ totalCount }} productos totales</p>
    </div>
    <div style="display: flex; gap: 10px; align-items: center">
      <input type="text" [(ngModel)]="search" (keyup.enter)="load(1)" placeholder="Buscar producto..." style="padding: 8px" />
      <button class="btn btn--secondary" (click)="load(1)">Buscar</button>
      <button class="btn btn--primary" (click)="onCreate.emit()">+ Nuevo Producto</button>
    </div>
  </div>

  <div *ngIf="loading" class="spinner"></div>

  <div class="card" *ngIf="!loading">
    <table class="data-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th>SKU</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Costo</th>
          <th>Stock</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of products" #row>
          <td class="fw-semibold">{{ p.name }}</td>
          <td class="font-mono text-muted">{{ p.sku || '—' }}</td>
          <td>{{ p.category || '—' }}</td>
          <td class="text-success fw-bold">RD$ {{ p.price | number:'1.2-2' }}</td>
          <td class="text-muted">RD$ {{ p.cost | number:'1.2-2' }}</td>
          <td>
            <span class="badge" [class.badge--danger]="p.lowStock" [class.badge--success]="!p.lowStock">
              {{ p.stock }}
            </span>
          </td>
          <td style="display:flex; gap:4px">
            <button class="btn btn--secondary btn--sm" (click)="onEdit.emit(p)">Editar</button>
            <button class="btn btn--accent btn--sm" (click)="openKardex(p)">Historial</button>
            <button class="btn btn--danger btn--sm" (click)="delete(p.id)">Eliminar</button>
          </td>
        </tr>
        <tr *ngIf="products.length === 0">
          <td colspan="7" style="text-align:center;padding:40px" class="text-muted">Sin productos registrados.</td>
        </tr>
      </tbody>
    </table>
    <div style="display: flex; justify-content: space-between; padding: 16px; align-items: center; border-top: 1px solid var(--border)">
      <span class="text-muted" style="font-size: 0.9rem">Mostrando página {{ page }}</span>
      <div style="display: flex; gap: 8px">
        <button class="btn btn--secondary btn--sm" [disabled]="page === 1" (click)="load(page - 1)">Anterior</button>
        <button class="btn btn--secondary btn--sm" [disabled]="products.length < pageSize" (click)="load(page + 1)">Siguiente</button>
      </div>
    </div>
  </div>

<!-- Kardex Modal -->
<div class="modal-overlay" *ngIf="showKardexModal" (click)="showKardexModal = false">
  <div class="modal modal--lg" (click)="$event.stopPropagation()" #kardexModal style="max-width: 900px">
    <h3>Historial: {{ selectedProductName }}</h3>
    <table class="data-table">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Referencia</th><th>Prev</th><th>Cant</th><th>Nuevo</th></tr></thead>
        <tbody>
            <tr *ngFor="let k of kardexEntries">
                <td>{{ k.transactionDate | date:'short' }}</td>
                <td>{{ k.type === 1 ? 'Compra' : k.type === 2 ? 'Venta' : 'Ajuste' }}</td>
                <td>{{ k.referenceNumber }}</td>
                <td>{{ k.previousStock }}</td>
                <td>{{ k.quantity }}</td>
                <td>{{ k.newStock }}</td>
            </tr>
        </tbody>
    </table>
    <div class="modal__footer"><button class="btn btn--secondary" (click)="showKardexModal = false">Cerrar</button></div>
  </div>
</div>
  `
})
export class ProductListComponent implements OnInit {
  @Output() onCreate = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<Product>();

  @ViewChildren('row') rows!: QueryList<ElementRef>;
  @ViewChildren('kardexModal') kardexModal!: QueryList<ElementRef>;

  products: Product[] = [];
  loading = true;
  page = 1;
  pageSize = 10;
  search = '';
  totalCount = 0;

  showKardexModal = false;
  selectedProductName = '';
  kardexEntries: InventoryTransaction[] = [];

  constructor(
    private productService: ProductService,
    private anime: AnimationService
  ) {}

  ngOnInit(): void { this.load(); }

  load(pageIndex?: number): void {
    if (pageIndex) this.page = pageIndex;
    this.loading = true;
    this.productService.getProducts(this.page, this.pageSize, this.search).subscribe({
      next: (res) => {
        this.products = res.items;
        this.totalCount = res.totalCount;
        this.loading = false;
        // Animate rows after render
        setTimeout(() => {
          this.anime.staggerIn(this.rows.map(r => r.nativeElement));
        }, 0);
      },
      error: () => this.loading = false
    });
  }

  openKardex(p: Product): void {
    this.selectedProductName = p.name;
    this.showKardexModal = true;
    this.productService.getKardex(p.id).subscribe(res => {
        this.kardexEntries = res;
        setTimeout(() => {
            if (this.kardexModal.first) {
                this.anime.modalIn(this.kardexModal.first.nativeElement);
            }
        }, 0);
    });
  }

  delete(id: string): void {
    if (!confirm('¿Eliminar producto?')) return;
    this.productService.deleteProduct(id).subscribe(() => this.load());
  }
}
