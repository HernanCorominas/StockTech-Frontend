import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Purchase, Product, CreatePurchase, Supplier, Branch } from '../../core/models/models';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>
  <div class="page-header">
    <div>
      <h1>Compras</h1>
      <p>{{ purchases.length }} compras registradas</p>
    </div>
    <button class="btn btn--primary" (click)="openCreate()">+ Nueva Compra</button>
  </div>

  <div *ngIf="loading" class="spinner"></div>

  <div class="card" *ngIf="!loading">
    <table class="data-table">
      <thead>
        <tr>
          <th># Compra</th>
          <th>Suplidor</th>
          <th>Sucursal</th>
          <th>Fecha</th>
          <th>Items</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of purchases">
          <td class="fw-bold font-mono text-accent">{{ p.purchaseNumber }}</td>
          <td class="fw-semibold">{{ p.supplierName }}</td>
          <td>{{ p.branchName || '—' }}</td>
          <td>{{ p.purchaseDate | date:'dd/MM/yyyy' }}</td>
          <td><span class="badge badge--accent">{{ p.items.length }} productos</span></td>
          <td class="fw-bold text-success">RD$ {{ p.total | number:'1.2-2' }}</td>
        </tr>
        <tr *ngIf="purchases.length === 0">
          <td colspan="6" style="text-align:center;padding:40px" class="text-muted">Sin compras registradas.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- Modal -->
<div class="modal-overlay" *ngIf="showModal" (click)="closeModal($event)">
  <div class="modal" style="max-width:640px" (click)="$event.stopPropagation()">
    <h3>Nueva Compra</h3>
    <div *ngIf="error" class="alert alert--error">{{ error }}</div>

    <div class="form-row">
      <div class="form-group">
        <label>Suplidor *</label>
        <select [(ngModel)]="supplierId" class="form-control">
          <option value="">-- Seleccionar Suplidor --</option>
          <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Sucursal (Opcional)</label>
        <select [(ngModel)]="branchId" class="form-control">
          <option value="">-- Seleccionar Sucursal --</option>
          <option *ngFor="let b of branches" [value]="b.id">{{ b.name }}</option>
        </select>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;margin-top:12px">
      <label style="font-size:0.8rem;font-weight:600;text-transform:uppercase;color:var(--text-secondary)">Productos a Comprar</label>
      <button class="btn btn--secondary" style="padding:6px 12px;font-size:0.8rem" (click)="addLine()">+ Agregar</button>
    </div>

    <div *ngFor="let line of lines; let i = index" style="display:flex;gap:8px;align-items:center;margin-bottom:8px;padding:8px;background:var(--glass);border-radius:8px">
      <select [(ngModel)]="line.productId" (ngModelChange)="onProductChange(i)"
        style="flex:2;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text-primary)">
        <option value="">-- Producto --</option>
        <option *ngFor="let p of products" [value]="p.id">{{ p.name }} (Stock: {{ p.stock }})</option>
      </select>
      <input type="number" [(ngModel)]="line.quantity" placeholder="Cant." min="1" (ngModelChange)="calcTotal()"
        style="flex:0.5;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text-primary)" />
      <input type="number" [(ngModel)]="line.unitCost" placeholder="Costo" min="0" (ngModelChange)="calcTotal()"
        style="flex:1;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text-primary)" />
      <div style="flex:0.8;color:var(--success);font-weight:700;font-size:0.85rem">
        RD$ {{ (line.quantity * line.unitCost) | number:'1.2-2' }}
      </div>
      <button class="btn btn--danger" style="padding:6px 10px;font-size:0.8rem" (click)="removeLine(i)">✕</button>
    </div>

    <div *ngIf="total > 0" style="margin-top:16px;padding:16px;background:var(--bg-secondary);border-radius:8px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <span style="color:var(--text-muted)">TOTAL COMPRA:</span>
      <span style="font-size:1.2rem;font-weight:700;color:var(--text-primary)">RD$ {{ total | number:'1.2-2' }}</span>
    </div>

    <div class="form-group" style="margin-top:16px">
      <label>Notas</label>
      <input [(ngModel)]="notes" placeholder="Notas opcionales..." />
    </div>

    <div class="modal__footer">
      <button class="btn btn--secondary" (click)="showModal = false">Cancelar</button>
      <button class="btn btn--primary" (click)="create()" [disabled]="saving">
        {{ saving ? 'Guardando...' : 'Registrar Compra' }}
      </button>
    </div>
  </div>
</div>
  `
})
export class PurchasesComponent implements OnInit {
  purchases: Purchase[] = [];
  products: Product[] = [];
  suppliers: Supplier[] = [];
  branches: Branch[] = [];
  loading = true;
  showModal = false;
  saving = false;
  error = '';
  
  supplierId = '';
  branchId = '';
  notes = '';
  total = 0;
  lines: { productId: string; quantity: number; unitCost: number }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getPurchases().subscribe({ next: (p) => { this.purchases = p; this.loading = false; }, error: () => this.loading = false });
    this.api.getProducts(1, 1000).subscribe({ next: (p) => this.products = p.items });
    this.api.getSuppliers().subscribe({ next: (s) => this.suppliers = s });
    this.api.getBranches().subscribe({ next: (b) => this.branches = b });
  }

  openCreate(): void {
    this.supplierId = ''; this.branchId = ''; this.notes = ''; this.lines = []; this.total = 0; this.error = '';
    this.showModal = true;
  }

  addLine(): void { this.lines.push({ productId: '', quantity: 1, unitCost: 0 }); }
  removeLine(i: number): void { this.lines.splice(i, 1); this.calcTotal(); }

  onProductChange(i: number): void {
    const prod = this.products.find(p => p.id === this.lines[i].productId);
    if (prod) this.lines[i].unitCost = prod.cost;
    this.calcTotal();
  }

  calcTotal(): void {
    this.total = this.lines.reduce((sum, l) => sum + (l.quantity * l.unitCost), 0);
  }

  create(): void {
    if (!this.supplierId) { this.error = 'El suplidor es requerido.'; return; }
    const validLines = this.lines.filter(l => l.productId && l.quantity > 0 && l.unitCost >= 0);
    if (validLines.length === 0) { this.error = 'Agrega al menos un producto.'; return; }

    this.saving = true; this.error = '';
    const payload: CreatePurchase = {
      supplierId: this.supplierId,
      branchId: this.branchId || undefined,
      items: validLines.map(l => ({ productId: l.productId, quantity: l.quantity, unitCost: l.unitCost })),
      notes: this.notes
    };

    this.api.createPurchase(payload).subscribe({
      next: (p) => {
        this.purchases.unshift(p);
        this.showModal = false; this.saving = false;
        this.api.getProducts(1, 1000).subscribe(prods => this.products = prods.items); // refresh stock
      },
      error: (e) => { this.error = e.error?.message ?? 'Error al registrar compra.'; this.saving = false; }
    });
  }

  closeModal(e: Event): void { if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.showModal = false; }
}
