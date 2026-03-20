import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Supplier, CreateSupplier } from '../../core/models/models';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>
  <div class="page-header">
    <div>
      <h1>Suplidores</h1>
      <p>{{ suppliers.length }} registrados</p>
    </div>
    <button class="btn btn--primary" (click)="showModal = true">+ Nuevo Suplidor</button>
  </div>

  <div *ngIf="loading" class="spinner"></div>

  <div class="card" *ngIf="!loading">
    <table class="data-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Contacto</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>RNC / Cédula</th>
          <th>Registrado</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let s of suppliers">
          <td class="fw-semibold">{{ s.name }}</td>
          <td>{{ s.contactName }}</td>
          <td>{{ s.phone }}</td>
          <td>{{ s.email }}</td>
          <td class="font-mono">{{ s.taxId }}</td>
          <td class="text-muted">{{ s.createdAt | date:'dd/MM/yyyy' }}</td>
        </tr>
        <tr *ngIf="suppliers.length === 0">
          <td colspan="6" style="text-align:center;padding:40px" class="text-muted">Sin suplidores registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- Modal -->
<div class="modal-overlay" *ngIf="showModal" (click)="closeModal($event)">
  <div class="modal" (click)="$event.stopPropagation()">
    <h3>Nuevo Suplidor</h3>
    <div *ngIf="error" class="alert alert--error">{{ error }}</div>

    <div class="form-group">
      <label>Nombre de la Empresa *</label>
      <input [(ngModel)]="form.name" placeholder="Ej. Tech Supplies SRL" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Nombre de Contacto</label>
        <input [(ngModel)]="form.contactName" placeholder="Ej. Juan Pérez" />
      </div>
      <div class="form-group">
        <label>RNC / Cédula *</label>
        <input [(ngModel)]="form.taxId" placeholder="130-12345-6" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Email</label>
        <input type="email" [(ngModel)]="form.email" placeholder="contacto@suplidor.com" />
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input [(ngModel)]="form.phone" placeholder="809-555-1111" />
      </div>
    </div>

    <div class="modal__footer">
      <button class="btn btn--secondary" (click)="showModal = false">Cancelar</button>
      <button class="btn btn--primary" (click)="create()" [disabled]="saving">
        {{ saving ? 'Guardando...' : 'Crear Suplidor' }}
      </button>
    </div>
  </div>
</div>
  `
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  loading = true;
  showModal = false;
  saving = false;
  error = '';

  form: CreateSupplier = { name: '', contactName: '', phone: '', email: '', taxId: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadSuppliers(); }

  loadSuppliers(): void {
    this.loading = true;
    this.api.getSuppliers().subscribe({
      next: (s) => { this.suppliers = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  create(): void {
    if (!this.form.name || !this.form.taxId) { this.error = 'Nombre y RNC/Cédula son requeridos.'; return; }
    this.saving = true; this.error = '';
    this.api.createSupplier(this.form).subscribe({
      next: (s) => { this.suppliers.unshift(s); this.showModal = false; this.saving = false; this.resetForm(); },
      error: (e) => { this.error = e.error?.message ?? 'Error al crear suplidor.'; this.saving = false; }
    });
  }

  resetForm(): void { this.form = { name: '', contactName: '', phone: '', email: '', taxId: '' }; }

  closeModal(e: Event): void { if ((e.target as HTMLElement).classList.contains('modal-overlay')) { this.showModal = false; } }
}
