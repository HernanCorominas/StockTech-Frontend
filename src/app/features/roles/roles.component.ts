import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { ToastService } from '../../core/services/toast.service';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { FlipTriggerDirective } from '../../shared/directives/flip-trigger.directive';
import { Role, Permission } from '../../core/models';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective, FlipTriggerDirective],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  private api = inject(ApiService);
  private authState = inject(AuthStateService);
  private toast = inject(ToastService);
  private sidebar = inject(SidebarService);

  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);
  
  showModal = signal(false);
  editingRole = signal<Role | null>(null);
  confirmDeleteModal = signal(false);
  roleToDelete = signal<Role | null>(null);
  submitted = signal(false);
  confirmPassword = '';

  roleForm = {
    name: '',
    description: '',
    permissionIds: [] as string[]
  };

  ngOnInit(): void {
    this.loadData();
    this.sidebar.setActions([
      {
        label: 'Nuevo Rol',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
        handler: () => this.openModal(),
        primary: true
      }
    ]);
  }

  ngOnDestroy(): void {
    this.sidebar.clear();
  }

  loadData(): void {
    this.api.getRoles().subscribe(roles => this.roles.set(roles));
    this.api.getPermissions().subscribe(perms => this.allPermissions.set(perms));
  }

  openModal(): void {
    this.editingRole.set(null);
    this.submitted.set(false);
    this.roleForm = { name: '', description: '', permissionIds: [] };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.submitted.set(false);
    this.showModal.set(false);
  }

  editRole(role: Role): void {
    this.editingRole.set(role);
    this.roleForm = {
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions.map(p => p.id)
    };
    this.showModal.set(true);
  }

  isPermissionSelected(id: string): boolean {
    return this.roleForm.permissionIds.includes(id);
  }

  togglePermission(id: string): void {
    const idx = this.roleForm.permissionIds.indexOf(id);
    if (idx > -1) {
      this.roleForm.permissionIds.splice(idx, 1);
    } else {
      this.roleForm.permissionIds.push(id);
    }
  }

  saveRole(): void {
    this.submitted.set(true);
    if (!this.roleForm.name || this.roleForm.permissionIds.length === 0) return;

    if (this.editingRole()) {
      this.api.updateRole(this.editingRole()!.id, this.roleForm).subscribe({
        next: () => {
          this.toast.show('Rol actualizado correctamente', 'success');
          this.loadData();
          this.closeModal();
        }
      });
    } else {
      this.api.createRole(this.roleForm).subscribe({
        next: () => {
          this.toast.show('Rol creado correctamente', 'success');
          this.loadData();
          this.closeModal();
        }
      });
    }
  }

  confirmDelete(role: Role): void {
    this.roleToDelete.set(role);
    this.confirmPassword = '';
    this.confirmDeleteModal.set(true);
  }

  performDelete(): void {
    this.api.verifyPassword(this.confirmPassword).subscribe({
      next: (res) => {
        if (res.isValid) {
          this.api.deleteRole(this.roleToDelete()!.id).subscribe({
            next: () => {
              this.toast.show('Rol eliminado correctamente', 'success');
              this.loadData();
              this.confirmDeleteModal.set(false);
            }
          });
        } else {
          this.toast.show('Contraseña incorrecta', 'error');
        }
      }
    });
  }
}
