import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Product, CreateProduct, UpdateProduct } from '../../core/models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>
  <div class="page-header">
    <div>
      <h1>Inventario</h1>
      <p>{{ products.length }} productos activos</p>
    </div>
    <button class="btn btn--primary" (click)="openCreate()">+ Nuevo Producto</button>
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
          <td>
            <button class="btn btn--secondary" style="padding:6px 12px;font-size:0.8rem" (click)="openEdit(p)">Editar</button>
            <button class="btn btn--danger" style="padding:6px 12px;font-size:0.8rem;margin-left:4px" (click)="delete(p.id)">Eliminar</button>
          </td>
        </tr>
        <tr *ngIf="products.length === 0">
          <td colspan="8" style="text-align:center;padding:40px" class="text-muted">Sin productos registrados.</td>
        </tr>
      </tbody>
    </table>
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
  `
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  showModal = false;
  saving = false;
  editId: string | null = null;
  error = '';

  form: any = { name: '', sku: '', description: '', price: 0, cost: 0, stock: 0, minStock: 0, category: '', isActive: true };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getProducts().subscribe({ next: (p) => { this.products = p; this.loading = false; }, error: () => this.loading = false });
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
