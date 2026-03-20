import { Component, OnInit, ViewChildren, QueryList, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { UserService, UserDto, RoleDto } from './services/user.service';
import { AnimationService } from '../../core/services/animation.service';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective],
  template: `
<div class="page-header" #header>
    <div>
      <h1>Gestión de Usuarios</h1>
      <p>{{ users().length }} usuarios en el sistema</p>
    </div>
    <button *appHasPermission="'user:write'" class="btn btn--primary" (click)="openModal()">+ Nuevo Usuario</button>
  </div>

  <div *ngIf="loading()" class="spinner"></div>

  <div class="card" *ngIf="!loading()">
    <table class="data-table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Nombre Completo</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of users()" #row>
          <td class="fw-semibold">{{ u.username }}</td>
          <td>{{ u.fullName || '—' }}</td>
          <td>{{ u.email || '—' }}</td>
          <td>
            <span class="badge badge--accent">{{ u.role.name }}</span>
          </td>
          <td>
            <span class="badge" [class.badge--success]="u.isActive" [class.badge--error]="!u.isActive">
              {{ u.isActive ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td>
            <button *appHasPermission="'user:write'" class="btn-icon" (click)="editUser(u)" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

<!-- Modal -->
<div class="modal-overlay" *ngIf="showModal" (click)="closeModal($event)">
  <div class="modal" (click)="$event.stopPropagation()" #modalRef>
    <h3>{{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
    <div *ngIf="error" class="alert alert--error">{{ error }}</div>

    <div class="form-row">
      <div class="form-group">
        <label>Nombre de Usuario *</label>
        <input [(ngModel)]="form.username" placeholder="Ej. jperetz" [disabled]="isEditing" />
      </div>
      <div class="form-group">
        <label>Rol *</label>
        <select [(ngModel)]="form.roleId">
          <option *ngFor="let r of roles" [value]="r.id">{{ r.name }}</option>
        </select>
      </div>
    </div>

    <div class="form-group" *ngIf="!isEditing">
      <label>Contraseña *</label>
      <input type="password" [(ngModel)]="form.password" placeholder="********" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Nombre Completo</label>
        <input [(ngModel)]="form.fullName" placeholder="Ej. Juan Pérez" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" [(ngModel)]="form.email" placeholder="correo@email.com" />
      </div>
    </div>

    <div class="form-group" *ngIf="isEditing">
        <label class="checkbox-container">
            <input type="checkbox" [(ngModel)]="form.isActive">
            <span class="checkmark"></span>
            Usuario Activo
        </label>
    </div>

    <div class="modal__footer">
      <button class="btn btn--secondary" (click)="showModal = false">Cancelar</button>
      <button class="btn btn--primary" (click)="save()" [disabled]="saving">
        {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Usuario') }}
      </button>
    </div>
  </div>
</div>
  `
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private anime = inject(AnimationService);

  @ViewChildren('row') rows!: QueryList<ElementRef>;
  @ViewChild('modalRef') modalRef!: ElementRef;

  users = this.userService.users;
  loading = this.userService.loading;
  roles: RoleDto[] = [];
  
  showModal = false;
  isEditing = false;
  saving = false;
  error = '';
  editingId: string | null = null;

  form = {
    username: '',
    password: '',
    fullName: '',
    email: '',
    roleId: '',
    isActive: true
  };

  ngOnInit(): void {
    this.userService.getAll().subscribe({
      next: () => {
        setTimeout(() => {
          this.anime.staggerIn(this.rows.map(r => r.nativeElement));
        }, 0);
      }
    });
    this.userService.getRoles().subscribe(r => this.roles = r);
  }

  openModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
    setTimeout(() => {
        if (this.modalRef) this.anime.modalIn(this.modalRef.nativeElement);
    }, 0);
  }

  editUser(user: UserDto): void {
    this.isEditing = true;
    this.editingId = user.id;
    this.form = {
      username: user.username,
      password: '',
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      isActive: user.isActive
    };
    this.showModal = true;
    setTimeout(() => {
        if (this.modalRef) this.anime.modalIn(this.modalRef.nativeElement);
    }, 0);
  }

  save(): void {
    if (!this.form.username || (!this.isEditing && !this.form.password) || !this.form.roleId) {
      this.error = 'Campos obligatorios faltantes.';
      return;
    }

    this.saving = true;
    this.error = '';

    const obs: Observable<any> = this.isEditing 
        ? this.userService.update(this.editingId!, this.form)
        : this.userService.create(this.form);

    obs.subscribe({
      next: () => {
        this.showModal = false;
        this.saving = false;
      },
      error: (e: any) => {
        this.error = e.error?.message ?? 'Error al procesar solicitud.';
        this.saving = false;
      }
    });
  }

  resetForm(): void {
    this.form = {
      username: '',
      password: '',
      fullName: '',
      email: '',
      roleId: this.roles[0]?.id || '',
      isActive: true
    };
  }

  closeModal(e: Event): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showModal = false;
    }
  }
}
