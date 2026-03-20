import { Component, OnInit, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AnimationService } from '../../core/services/animation.service';
import { Client, CreateClient } from '../../core/models/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-header" #header>
    <div>
      <h1>Clientes</h1>
      <p>{{ clients.length }} clientes registrados</p>
    </div>
    <button class="btn btn--primary" (click)="openModal()">+ Nuevo Cliente</button>
  </div>

  <div *ngIf="loading" class="spinner"></div>

  <div class="card" *ngIf="!loading">
    <table class="data-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Documento</th>
          <th>Tipo</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Registrado</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of clients" #row>
          <td class="fw-semibold">{{ c.name }}</td>
          <td class="font-mono">{{ c.document }}</td>
          <td>
            <span class="badge" [class.badge--accent]="c.clientType === 1" [class.badge--success]="c.clientType === 2">
              {{ c.clientType === 1 ? 'Individual' : 'Empresa' }}
            </span>
          </td>
          <td>{{ c.email || '—' }}</td>
          <td>{{ c.phone || '—' }}</td>
          <td class="text-muted">{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
        </tr>
        <tr *ngIf="clients.length === 0">
          <td colspan="6" style="text-align:center;padding:40px" class="text-muted">Sin clientes registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>

<!-- Modal -->
<div class="modal-overlay" *ngIf="showModal" (click)="closeModal($event)">
  <div class="modal" (click)="$event.stopPropagation()" #modalRef>
    <h3>Nuevo Cliente</h3>
    <div *ngIf="error" class="alert alert--error">{{ error }}</div>

    <div class="form-row">
      <div class="form-group">
        <label>Nombre Completo / Razón Social *</label>
        <input [(ngModel)]="form.name" placeholder="Ej. Juan Pérez" />
      </div>
      <div class="form-group">
        <label>Tipo de Cliente *</label>
        <select [(ngModel)]="form.clientType">
          <option [value]="1">Individual (Cédula)</option>
          <option [value]="2">Empresa (RNC)</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>{{ form.clientType == 1 ? 'Cédula' : 'RNC' }} *</label>
      <input [(ngModel)]="form.document" [placeholder]="form.clientType == 1 ? '001-1234567-8' : '130-12345-6'" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Email</label>
        <input type="email" [(ngModel)]="form.email" placeholder="correo@email.com" />
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input [(ngModel)]="form.phone" placeholder="809-555-0000" />
      </div>
    </div>

    <div class="form-group">
      <label>Dirección</label>
      <input [(ngModel)]="form.address" placeholder="Calle, Ciudad, Provincia" />
    </div>

    <div class="modal__footer">
      <button class="btn btn--secondary" (click)="showModal = false">Cancelar</button>
      <button class="btn btn--primary" (click)="create()" [disabled]="saving">
        {{ saving ? 'Guardando...' : 'Crear Cliente' }}
      </button>
    </div>
  </div>
</div>
  `
})
export class ClientsComponent implements OnInit {
  @ViewChildren('row') rows!: QueryList<ElementRef>;
  @ViewChild('modalRef') modalRef!: ElementRef;

  clients: Client[] = [];
  loading = true;
  showModal = false;
  saving = false;
  error = '';

  form: CreateClient = { name: '', document: '', clientType: 1 };

  constructor(
    private api: ApiService,
    private anime: AnimationService
  ) {}

  ngOnInit(): void { this.loadClients(); }

  loadClients(): void {
    this.loading = true;
    this.api.getClients().subscribe({
      next: (c) => { 
        this.clients = c; 
        this.loading = false;
        setTimeout(() => {
          this.anime.staggerIn(this.rows.map(r => r.nativeElement));
        }, 0);
      },
      error: () => { this.loading = false; }
    });
  }

  openModal(): void {
    this.showModal = true;
    this.error = '';
    setTimeout(() => {
        if (this.modalRef) this.anime.modalIn(this.modalRef.nativeElement);
    }, 0);
  }

  create(): void {
    if (!this.form.name || !this.form.document) { this.error = 'Nombre y documento son requeridos.'; return; }
    this.saving = true; this.error = '';
    this.api.createClient({ ...this.form, clientType: Number(this.form.clientType) }).subscribe({
      next: (c) => { 
        this.clients.unshift(c); 
        this.showModal = false; 
        this.saving = false; 
        this.resetForm(); 
        setTimeout(() => this.anime.fadeIn(this.rows.first.nativeElement), 0);
      },
      error: (e) => { this.error = e.error?.message ?? 'Error al crear cliente.'; this.saving = false; }
    });
  }

  resetForm(): void { this.form = { name: '', document: '', clientType: 1 }; }

  closeModal(e: Event): void { if ((e.target as HTMLElement).classList.contains('modal-overlay')) { this.showModal = false; } }
}
