import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Product, CreateProduct, UpdateProduct, InventoryTransaction } from '../../core/models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>
<div class="page-header">
    <div>
      <h1>Inventario</h1>
      <p>{{ totalCount }} productos totales</p>
    </div>
    <div style="display: flex; gap: 10px; align-items: center">
      <input type="text" [(ngModel)]="search" (keyup.enter)="load(1)" placeholder="Buscar producto..." style="padding: 8px" />
      <button class="btn btn--secondary" (click)="load(1)">Buscar</button>
      <button class="btn btn--primary" (click)="openCreate()">+ Nuevo Producto</button>
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
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of products">
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
          <td>
            <span class="badge" [class.badge--warning]="p.lowStock" [class.badge--success]="!p.lowStock">
              {{ p.lowStock ? '⚠️ Stock Bajo' : '✓ Normal' }}
            </span>
          </td>
          <td style="display:flex; gap:4px">
            <button class="btn btn--secondary" style="padding:6px 12px;font-size:0.8rem" (click)="openEdit(p)">Editar</button>
            <button class="btn btn--accent" style="padding:6px 12px;font-size:0.8rem" (click)="openKardex(p)">Historial</button>
            <button class="btn btn--danger" style="padding:6px 12px;font-size:0.8rem" (click)="delete(p.id)">Eliminar</button>
          </td>
        </tr>
        <tr *ngIf="products.length === 0">
          <td colspan="8" style="text-align:center;padding:40px" class="text-muted">Sin productos registrados.</td>
        </tr>
      </tbody>
    </table>
    <div style="display: flex; justify-content: space-between; padding: 16px; align-items: center; border-top: 1px solid #ddd">
      <span class="text-muted" style="font-size: 0.9rem">Mostrando página {{ page }}</span>
      <div style="display: flex; gap: 8px">
        <button class="btn btn--secondary" style="padding: 6px 12px; font-size: 0.9rem" [disabled]="page === 1" (click)="load(page - 1)">Anterior</button>
        <button class="btn btn--secondary" style="padding: 6px 12px; font-size: 0.9rem" [disabled]="products.length < pageSize" (click)="load(page + 1)">Siguiente</button>
      </div>
    </div>
  </div>
</div>

<!-- Create/Edit Modal -->
<div class="modal-overlay" *ngIf="showModal" (click)="closeModal($event)">
  <div class="modal" (click)="$event.stopPropagation()">
    <h3>{{ editId ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
    <div *ngIf="error" class="alert alert--error">{{ error }}</div>

    <div class="form-row">
      <div class="form-group">
        <label>Nombre *</label>
        <input [(ngModel)]="form.name" placeholder="Nombre del producto" />
      </div>
      <div class="form-group">
        <label>SKU</label>
        <input [(ngModel)]="form.sku" placeholder="PROD-001" />
      </div>
    </div>

    <div class="form-group">
      <label>Descripción</label>
      <textarea [(ngModel)]="form.description" placeholder="Descripción del producto"></textarea>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Precio de Venta (RD$) *</label>
        <input type="number" [(ngModel)]="form.price" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label>Costo (RD$) *</label>
        <input type="number" [(ngModel)]="form.cost" placeholder="0.00" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Stock Inicial</label>
        <input type="number" [(ngModel)]="form.stock" placeholder="0" [disabled]="!!editId" />
      </div>
      <div class="form-group">
        <label>Stock Mínimo</label>
        <input type="number" [(ngModel)]="form.minStock" placeholder="0" />
      </div>
    </div>

    <div class="form-group">
      <label>Categoría</label>
      <input [(ngModel)]="form.category" placeholder="Ej. Laptops, Monitores" />
    </div>

    <div class="modal__footer">
      <button class="btn btn--secondary" (click)="showModal = false">Cancelar</button>
      <button class="btn btn--primary" (click)="save()" [disabled]="saving">
        {{ saving ? 'Guardando...' : (editId ? 'Actualizar' : 'Crear Producto') }}
      </button>
    </div>
  </div>
</div>

<!-- Kardex Modal -->
<div class="modal-overlay" *ngIf="showKardexModal" (click)="showKardexModal = false">
  <div class="modal modal--lg" (click)="$event.stopPropagation()" style="max-width: 900px">
    <div class="modal__header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
      <h3>Historial de Movimientos: {{ selectedProductName }}</h3>
      <button class="btn btn--secondary" (click)="showKardexModal = false">✕</button>
    </div>

    <div *ngIf="loadingKardex" class="spinner"></div>

    <table class="data-table" *ngIf="!loadingKardex">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Referencia</th>
          <th>Previo</th>
          <th>Cant.</th>
          <th>Nuevo</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let k of kardexEntries">
          <td>{{ k.transactionDate | date:'dd/MM/yyyy HH:mm' }}</td>
          <td>
            <span class="badge" [class.badge--success]="k.type === 1" [class.badge--warning]="k.type === 2" [class.badge--accent]="k.type === 3">
              {{ k.type === 1 ? 'Compra' : k.type === 2 ? 'Venta' : 'Ajuste' }}
            </span>
          </td>
          <td class="font-mono text-muted">{{ k.referenceNumber || '—' }}</td>
          <td>{{ k.previousStock }}</td>
          <td [class.text-success]="k.type === 1" [class.text-danger]="k.type === 2">
            {{ k.type === 1 ? '+' : '-' }}{{ k.quantity }}
          </td>
          <td class="fw-bold">{{ k.newStock }}</td>
        </tr>
        <tr *ngIf="kardexEntries.length === 0">
          <td colspan="6" style="text-align:center;padding:40px" class="text-muted">No hay movimientos registrados.</td>
        </tr>
      </tbody>
    </table>

    <div class="modal__footer" style="margin-top:20px">
      <button class="btn btn--secondary" (click)="showKardexModal = false">Cerrar</button>
    </div>
  </div>
</div>
  `
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  showModal = false;
  saving = false;
  editId: string | null = null;
  error = '';

  page = 1;
  pageSize = 10;
  search = '';
  totalCount = 0;

  // Kardex
  showKardexModal = false;
  loadingKardex = false;
  selectedProductName = '';
  kardexEntries: InventoryTransaction[] = [];

  form: any = { name: '', sku: '', description: '', price: 0, cost: 0, stock: 0, minStock: 0, category: '', isActive: true };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(pageIndex?: number): void {
    if (pageIndex) this.page = pageIndex;
    this.loading = true;
    this.api.getProducts(this.page, this.pageSize, this.search).subscribe({ 
        next: (p) => { 
            this.products = p.items; 
            this.totalCount = p.totalCount;
            this.loading = false; 
        }, 
        error: () => this.loading = false 
    });
  }

  openCreate(): void {
    this.editId = null;
    this.form = { name: '', sku: '', description: '', price: 0, cost: 0, stock: 0, minStock: 0, category: '', isActive: true };
    this.error = '';
    this.showModal = true;
  }

  openEdit(p: Product): void {
    this.editId = p.id;
    this.form = { name: p.name, sku: p.sku, description: p.description, price: p.price, cost: p.cost, stock: p.stock, minStock: p.minStock, category: p.category, isActive: p.isActive };
    this.error = '';
    this.showModal = true;
  }

  openKardex(p: Product): void {
    this.selectedProductName = p.name;
    this.showKardexModal = true;
    this.loadingKardex = true;
    this.api.getKardex(p.id).subscribe({
      next: (k) => {
        this.kardexEntries = k;
        this.loadingKardex = false;
      },
      error: () => this.loadingKardex = false
    });
  }

  save(): void {
    if (!this.form.name) { this.error = 'El nombre es requerido.'; return; }
    this.saving = true; this.error = '';

    const obs = this.editId
      ? this.api.updateProduct(this.editId, this.form as UpdateProduct)
      : this.api.createProduct(this.form as CreateProduct);

    obs.subscribe({
      next: () => { this.showModal = false; this.saving = false; this.load(); },
      error: (e) => { this.error = e.error?.message ?? 'Error.'; this.saving = false; }
    });
  }

  delete(id: string): void {
    if (!confirm('¿Eliminar este producto?')) return;
    this.api.deleteProduct(id).subscribe({ next: () => this.load() });
  }

  closeModal(e: Event): void { if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.showModal = false; }
}

