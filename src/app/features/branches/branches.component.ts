import { Component, OnInit, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AnimationService } from '../../core/services/animation.service';
import { Branch, CreateBranch } from '../../core/models/models';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-header" #header>
    <div>
      <h1>Sucursales</h1>
      <p>{{ branches.length }} registradas</p>
    </div>
    <button class="btn btn--primary" (click)="openModal()">+ Nueva Sucursal</button>
  </div>

  <div *ngIf="loading" class="spinner"></div>

  <div class="card" *ngIf="!loading">
    <table class="data-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Dirección</th>
          <th>Teléfono</th>
          <th>Administrador</th>
          <th>Registrado</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let b of branches" #row>
          <td class="fw-semibold">{{ b.name }}</td>
          <td>{{ b.address }}</td>
          <td>{{ b.phone }}</td>
          <td>{{ b.managerName }}</td>
          <td class="text-muted">{{ b.createdAt | date:'dd/MM/yyyy' }}</td>
        </tr>
        <tr *ngIf="branches.length === 0">
          <td colspan="5" style="text-align:center;padding:40px" class="text-muted">Sin sucursales registradas.</td>
        </tr>
      </tbody>
    </table>
  </div>

<!-- Modal -->
<div class="modal-overlay" *ngIf="showModal" (click)="closeModal($event)">
  <div class="modal" (click)="$event.stopPropagation()" #modalRef>
    <h3>Nueva Sucursal</h3>
    <div *ngIf="error" class="alert alert--error">{{ error }}</div>

    <div class="form-group">
      <label>Nombre de la Sucursal *</label>
      <input [(ngModel)]="form.name" placeholder="Ej. Central, Bella Vista, etc." />
    </div>

    <div class="form-group">
      <label>Dirección *</label>
      <input [(ngModel)]="form.address" placeholder="Av. Principal #123" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Teléfono</label>
        <input [(ngModel)]="form.phone" placeholder="809-555-2222" />
      </div>
      <div class="form-group">
        <label>Administrador</label>
        <input [(ngModel)]="form.managerName" placeholder="Ej. María López" />
      </div>
    </div>

    <div class="modal__footer">
      <button class="btn btn--secondary" (click)="showModal = false">Cancelar</button>
      <button class="btn btn--primary" (click)="create()" [disabled]="saving">
        {{ saving ? 'Guardando...' : 'Crear Sucursal' }}
      </button>
    </div>
  </div>
</div>
  `
})
export class BranchesComponent implements OnInit {
  @ViewChildren('row') rows!: QueryList<ElementRef>;
  @ViewChild('modalRef') modalRef!: ElementRef;

  branches: Branch[] = [];
  loading = true;
  showModal = false;
  saving = false;
  error = '';

  form: CreateBranch = { name: '', address: '', phone: '', managerName: '' };

  constructor(
    private api: ApiService,
    private anime: AnimationService
  ) {}

  ngOnInit(): void { this.loadBranches(); }

  loadBranches(): void {
    this.loading = true;
    this.api.getBranches().subscribe({
      next: (b) => { 
        this.branches = b; 
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
    if (!this.form.name || !this.form.address) { this.error = 'Nombre y dirección son requeridos.'; return; }
    this.saving = true; this.error = '';
    this.api.createBranch(this.form).subscribe({
      next: (b) => { 
        this.branches.unshift(b); 
        this.showModal = false; 
        this.saving = false; 
        this.resetForm(); 
        setTimeout(() => this.anime.fadeIn(this.rows.first.nativeElement), 0);
      },
      error: (e) => { this.error = e.error?.message ?? 'Error al crear sucursal.'; this.saving = false; }
    });
  }

  resetForm(): void { this.form = { name: '', address: '', phone: '', managerName: '' }; }

  closeModal(e: Event): void { if ((e.target as HTMLElement).classList.contains('modal-overlay')) { this.showModal = false; } }
}
