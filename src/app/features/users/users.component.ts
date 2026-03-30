import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService, UserDto, RoleDto } from './services/user.service';
import { FlipAnimationService } from '../../core/services/flip-animation.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { Branch } from '../../core/models';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { FlipTriggerDirective } from '../../shared/directives/flip-trigger.directive';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective, FlipTriggerDirective],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private anime = inject(FlipAnimationService);
  private api = inject(ApiService);
  private auth = inject(AuthStateService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private sidebar = inject(SidebarService);

  @ViewChildren('row') rows!: QueryList<ElementRef>;

  users = this.userService.users;
  loading = this.userService.loading;
  
  showForm = signal(false);
  isEditing = false;
  editingId = '';
  saving = false;
  submitted = false;
  selectedUser = signal<UserDto | null>(null);

  roles = signal<RoleDto[]>([]);
  branches = signal<Branch[]>([]);
  isGlobalAdmin = signal(false);
  currentUserId = '';

  loadUsers(): void {
    const branchId = this.auth.isManager() ? this.auth.currentUser()?.branchId : undefined;
    this.userService.getAll(branchId).subscribe();
  }

  canModifyUser(u: UserDto): boolean {
    const currentUser = this.auth.currentUser();
    if (!currentUser) return false;
    
    // If target is Admin AND target is NOT current user AND current user is Admin
    // then cannot modify (following request: "si el usuario es admin como yo pues no debo poder modificar nada de ese otro admin")
    if (u.role.name?.toLowerCase() === 'admin' && u.id !== this.currentUserId && currentUser.role?.toLowerCase() === 'admin') {
      return false;
    }
    
    // Default to existing permission check if needed, but since we are in Admin view
    // and we already checked Admin vs Admin, we allow it if user has permission.
    // Assuming 'Admin' role implies permission.
    return true; 
  }


  form: any = { fullName: '', username: '', email: '', password: '', roleId: 'User', isActive: true, branchId: '' };

  ngOnInit(): void {
    const user = this.auth.currentUser();
    this.isGlobalAdmin.set(user?.role?.toLowerCase() === 'admin');
    this.currentUserId = user?.id || '';

    this.loadUsers();

    this.userService.getRoles().subscribe(roles => this.roles.set(roles));
    
    if (this.isGlobalAdmin()) {
      this.api.getBranches().subscribe(branches => this.branches.set(branches));
    }

    this.sidebar.setActions([
      {
        label: 'Nuevo Usuario',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>',
        handler: () => this.openForm(),
        primary: true
      }
    ]);
  }

  ngOnDestroy(): void {
    this.sidebar.clear();
  }

  openForm() {
    const trigger = document.querySelector('[data-flip-id="user-action"]') as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = trigger ? this.anime.getState(trigger) : null;

    this.isEditing = false;
    this.submitted = false;
    this.form = { fullName: '', username: '', email: '', password: '', roleId: '', branchId: '', isActive: true };
    if (this.roles().length > 0) this.form.roleId = this.roles()[0].id;
    this.showForm.set(true);
    
    requestAnimationFrame(() => {
      if (state) this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('.inline-form-panel') as HTMLElement;
      
      if (panel) {
        this.anime.animateModal(panel, triggerRect);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  editUser(u: UserDto) {
    const trigger = document.querySelector(`[appFlipTrigger="user-row-${u.id}"]`) as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = this.anime.getState(trigger || '[data-flip-id="user-action"]');

    this.isEditing = true;
    this.submitted = false;
    this.editingId = u.id;
    
    // Map branchId from UserBranches if it exists but is not on the root object
    const userBranchId = (u as any).userBranches?.[0]?.branchId || u.branchId;
    
    this.form = { ...u, branchId: userBranchId };
    this.showForm.set(true);
    
    requestAnimationFrame(() => {
      this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('.inline-form-panel') as HTMLElement;
      
      if (panel) {
        this.anime.animateModal(panel, triggerRect);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  closeForm() {
    const selector = '[data-flip-id="user-action"]';
    const state = document.querySelector(selector) ? this.anime.getState(selector) : null;
    const panel = document.querySelector('.inline-form-panel') as HTMLElement;

    this.anime.animateModalOut(panel)?.eventCallback('onComplete', () => {
      this.selectedUser.set(null);
      this.showForm.set(false);
      if (state) this.anime.from(state, { borderRadius: '20px' });
    });
  }

  save(): void {
    this.submitted = true;
    
    // Base validation
    const hasBaseFields = this.form.fullName && this.form.username && this.form.email && (this.isEditing || this.form.password);
    if (!hasBaseFields) return;

    // Multi-tenant validation: If not Admin, must have a branch
    const selectedRole = this.roles().find(r => r.id === this.form.roleId);
    const isAdmin = selectedRole?.name?.toLowerCase() === 'admin' || selectedRole?.name?.toLowerCase() === 'systemadmin';
    
    if (!isAdmin && !this.form.branchId) {
      this.toast.error('Cada usuario que no sea administrador debe estar asociado a una sucursal.');
      return;
    }

    this.saving = true;
    const obs = this.isEditing 
      ? this.userService.update(this.editingId, this.form)
      : this.userService.create(this.form);

    (obs as any).subscribe({
      next: () => {
        this.toast.success(this.isEditing ? 'Usuario actualizado' : 'Usuario creado');
        this.closeForm();
        this.loadUsers();
      },
      error: (e: any) => {
        this.toast.error(e.error?.message || 'Error al guardar usuario');
        this.saving = false;
      }
    });
  }

  deleteUser(id: string): void {
    this.confirm.confirm('¿Eliminar usuario?', 'Esta acción no se puede deshacer.').then(ok => {
      if (ok) {
        this.userService.delete(id).subscribe({
          next: () => {
            this.toast.success('Usuario eliminado');
            this.loadUsers();
          },
          error: (e: any) => this.toast.error(e.error?.message || 'Error al eliminar')
        });
      }
    });
  }

  isFormRoleAdmin(): boolean {
    const selectedRole = this.roles().find(r => r.id === this.form.roleId);
    return selectedRole?.name?.toLowerCase() === 'admin' || selectedRole?.name?.toLowerCase() === 'systemadmin';
  }
}
