import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { FlipAnimationService } from '../../../../core/services/flip-animation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { BranchStateService } from '../../../../core/services/branch-state.service';
import { Supplier, CreateSupplier } from '../../../../core/models';
import { SharedDropdownComponent, DropdownItem } from '../../../../shared/components/shared-dropdown/shared-dropdown.component';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedDropdownComponent],
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.scss']
})
export class SupplierFormComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private authState = inject(AuthStateService);
  private branchState = inject(BranchStateService);

  @Input() supplier: Supplier | null = null;
  @Input() isActive = false;
  @Input() flipId = 'supplier-action';
  @Input() initialBranchId?: string;

  @Output() onSave = new EventEmitter<Supplier>();
  @Output() onCancel = new EventEmitter<void>();

  form: CreateSupplier = { name: '', contactName: '', phone: '', email: '', taxId: '', branchId: undefined };
  branchItems: DropdownItem[] = [];
  saving = false;
  submitted = false;
  error = '';

  ngOnInit() {
    this.loadBranches();
    if (this.supplier) {
      this.form = { 
        name: this.supplier.name, 
        contactName: this.supplier.contactName, 
        phone: this.supplier.phone, 
        email: this.supplier.email, 
        taxId: this.supplier.taxId, 
        branchId: this.supplier.branchId 
      };
    } else if (this.initialBranchId) {
      this.form.branchId = this.initialBranchId;
    }
  }

  loadBranches() {
    const isGlobalAdmin = this.authState.isAdmin();
    
    this.api.getBranches().subscribe(allBranches => {
      // Filter branches if not admin
      let filtered = allBranches;
      if (!isGlobalAdmin) {
        const authBranchIds = this.branchState.authorizedBranches().map(ab => ab.branchId);
        filtered = allBranches.filter(b => authBranchIds.includes(b.id));
      }

      this.branchItems = filtered.map(b => ({ id: b.id, label: b.name, sublabel: b.address }));

      // Auto-selection logic for new records
      if (!this.supplier && !this.form.branchId) {
        if (this.branchItems.length === 1) {
          this.form.branchId = this.branchItems[0].id;
        } else if (this.initialBranchId) {
          this.form.branchId = this.initialBranchId;
        }
      }
    });
  }

  save() {
    this.submitted = true;
    if (!this.form.name || !this.form.taxId || !this.form.email) { 
      return; 
    }

    this.saving = true;
    this.error = '';

    const obs$ = this.supplier
      ? this.api.updateSupplier(this.supplier.id, this.form)
      : this.api.createSupplier(this.form);

    obs$.subscribe({
      next: (res) => {
        this.saving = false;
        this.toast.success(this.supplier ? 'Suplidor actualizado' : 'Suplidor registrado');
        this.onSave.emit(res);
      },
      error: (e) => {
        this.error = e.error?.message ?? 'Error al procesar la solicitud.';
        this.saving = false;
      }
    });
  }
}
