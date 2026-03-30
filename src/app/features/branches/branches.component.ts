import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FlipAnimationService } from '../../core/services/flip-animation.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { BranchStateService } from '../../core/services/branch-state.service';
import { Branch, CreateBranch, Role, User } from '../../core/models';
import { FlipTriggerDirective } from '../../shared/directives/flip-trigger.directive';
import { SharedDropdownComponent, DropdownItem } from '../../shared/components/shared-dropdown/shared-dropdown.component';
import { SidebarService } from '../../core/services/sidebar.service';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule, FlipTriggerDirective, SharedDropdownComponent],
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss']
})
export class BranchesComponent implements OnInit {
  private api = inject(ApiService);
  private anime = inject(FlipAnimationService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private branchState = inject(BranchStateService);
  private sidebar = inject(SidebarService);
  public authState = inject(AuthStateService);
  
  isAdmin = this.authState.isAdmin;

  @ViewChildren('card') cards!: QueryList<ElementRef>;

  branches: Branch[] = [];
  userItems: DropdownItem[] = [];
  roles: Role[] = [];
  loading = true;
  showForm = false;
  showUserForm = false;
  selectedId = '';
  selectedBranch: Branch | null = null;
  saving = false;
  creatingUser = false;
  submitted = false;
  userSubmitted = false;


  form: CreateBranch = { name: '', address: '', phone: '', managerId: undefined, isActive: true };
  
  userForm = { fullName: '', email: '', username: '', password: '', roleId: '' };

  ngOnInit(): void { 
    this.load();
    this.loadUsers();
    this.loadRoles();
    
    if (this.isAdmin()) {
      this.sidebar.setActions([
        {
          label: 'Nueva Sucursal',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
          handler: () => this.openForm(),
          primary: true
        }
      ]);
    }
  }

  ngOnDestroy(): void {
    this.sidebar.clear();
  }

  load(): void {
    this.loading = true;
    this.api.getBranches().subscribe({
      next: (res) => {
        this.branches = res;
        this.loading = false;
        requestAnimationFrame(() => {
          this.anime.staggerIn(this.cards.map(c => c.nativeElement));
        });
      },
      error: () => this.loading = false
    });
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: (users) => {
        // Filter to show users that can be assigned as branch managers.
        // Include any user whose role implies management or administration.
        const filteredUsers = users.filter(u => {
          const roleStr = (u.roleName || u.role?.name || '').toLowerCase();
          return roleStr.includes('manager') || 
                 roleStr.includes('encargado') ||
                 roleStr.includes('admin');
        });

        this.userItems = filteredUsers.map(u => ({
          id: u.id,
          label: u.fullName,
          sublabel: u.roleName || u.role?.name || 'Usuario'
        }));
      }
    });
  }

  loadRoles(): void {
    this.api.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      }
    });
  }

  createUser(): void {
    this.userSubmitted = true;
    if (!this.userForm.fullName || !this.userForm.email || !this.userForm.username || !this.userForm.password) {
      return;
    }

    const managerRole = this.roles.find(r => 
      r.name.toLowerCase().includes('manager') || 
      r.name.toLowerCase().includes('encargado') || 
      r.name.toLowerCase().includes('administrador de sucursal') ||
      r.name === 'Manager'
    );

    if (!managerRole) {
      this.toast.error('No se encontró el rol de Encargado en el sistema');
      return;
    }

    this.creatingUser = true;
    this.userForm.roleId = managerRole.id;

    this.api.createUser(this.userForm).subscribe({
      next: (user: any) => {
        this.creatingUser = false;
        this.toast.success('Encargado creado exitosamente');
        
        // Add immediately to items list so it's selectable before async load finishes
        this.userItems = [
          ...this.userItems, 
          { id: user.id, label: user.fullName || this.userForm.fullName, sublabel: 'Nuevo Encargado' }
        ];
        
        // Refresh users in the background
        this.loadUsers();
        
        // Set the managerId in the main branch form automatically
        this.form.managerId = user.id;
        this.showUserForm = false;
        
        // Reset user form
        this.userForm = { fullName: '', email: '', username: '', password: '', roleId: '' };
      },
      error: (err: any) => {
        this.creatingUser = false;
        this.toast.error(err.error?.message || 'Error al crear usuario');
      }
    });
  }


  openForm() {
    this.refreshAuxiliaryData();
    const trigger = document.querySelector('[data-flip-id="branch-action"]') as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = trigger ? this.anime.getState(trigger) : null;

    this.selectedId = '';
    this.selectedBranch = null;
    this.showUserForm = false;
    this.submitted = false;
    this.userSubmitted = false;
    this.form = { name: '', address: '', phone: '', managerId: undefined, isActive: true };
    this.showForm = true;
    requestAnimationFrame(() => {
      if (state) this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('.inline-form-panel') as HTMLElement;
      
      if (panel) {
        this.anime.animateModal(panel, triggerRect);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  editBranch(b: Branch) {
    this.refreshAuxiliaryData();
    const trigger = document.querySelector(`[appFlipTrigger="branch-row-${b.id}"]`) as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = this.anime.getState(trigger || '[data-flip-id="branch-action"]');

    this.selectedId = b.id;
    this.selectedBranch = b;
    this.showUserForm = false;
    this.submitted = false;
    this.userSubmitted = false;
    this.form = { name: b.name, address: b.address, phone: b.phone, managerId: b.managerId, isActive: b.isActive };
    this.showForm = true;
    requestAnimationFrame(() => {
      if (state) this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('.inline-form-panel') as HTMLElement;
      
      if (panel) {
        this.anime.animateModal(panel, triggerRect);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  refreshAuxiliaryData() {
    this.loadUsers();
    this.loadRoles();
  }

  closeForm() {
    const selector = '[data-flip-id="branch-action"]';
    const state = document.querySelector(selector) ? this.anime.getState(selector) : null;
    const panel = document.querySelector('.inline-form-panel') as HTMLElement;

    if (panel) {
      this.anime.animateModalOut(panel)?.eventCallback('onComplete', () => {
        this.selectedBranch = null;
        this.showForm = false;
        this.showUserForm = false;
        if (state) this.anime.from(state, { borderRadius: '20px' });
      });
    } else {
      this.showForm = false;
      this.showUserForm = false;
    }
  }

  save() {
    this.submitted = true;
    if (!this.form.name || !this.form.address) {
      return;
    }
    this.saving = true;
    const obs$ = this.selectedId 
      ? this.api.updateBranch(this.selectedId, this.form) 
      : this.api.createBranch(this.form);

    obs$.subscribe({
      next: () => {
        this.saving = false;
        this.toast.success(this.selectedId ? 'Sucursal actualizada con éxito' : 'Sucursal registrada con éxito');
        this.branchState.notifyBranchChanged();
        this.closeForm();
        this.load();
      },
      error: (err: any) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Ocurrió un error al procesar la solicitud');
      }
    });
  }

  async deleteBranch(id: string) {
    const ok = await this.confirm.confirm('¿Estás seguro de que deseas eliminar esta sucursal? Esta acción no se puede deshacer.', 'Eliminar Sucursal');
    if (!ok) return;
    
    this.api.deleteBranch(id).subscribe({
      next: () => {
        this.toast.success('Sucursal eliminada');
        this.branchState.notifyBranchChanged();
        this.load();
      },
      error: (err: any) => this.toast.error('Error al eliminar sucursal: ' + (err.error?.message || 'Error desconocido'))
    });
  }
}
