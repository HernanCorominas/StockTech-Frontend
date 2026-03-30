import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Purchase, Product, CreatePurchase, Supplier, Branch, CreatePurchaseItem } from '../../core/models';
import { FlipAnimationService } from '../../core/services/flip-animation.service';
import { FlipTriggerDirective } from '../../shared/directives/flip-trigger.directive';
import { SharedDropdownComponent, DropdownItem } from '../../shared/components/shared-dropdown/shared-dropdown.component';
import { SupplierFormComponent } from '../suppliers/components/supplier-form/supplier-form.component';
import { BranchStateService } from '../../core/services/branch-state.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule, FlipTriggerDirective, SharedDropdownComponent, SupplierFormComponent],
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private anime = inject(FlipAnimationService);
  public branchState = inject(BranchStateService);
  private sidebar = inject(SidebarService);

  purchases: Purchase[] = [];
  supplierItems: DropdownItem[] = [];
  branchItems: DropdownItem[] = [];
  products: Product[] = [];
  
  loading = true;
  showForm = false;
  showSupplierForm = false;
  saving = false;
  error = '';

  supplierId = '';
  branchId = '';
  notes = '';
  subTotalAmount = 0;
  taxTotalAmount = 0;
  totalAmount = 0;
  items: any[] = [];

  constructor() {
    toObservable(this.branchState.selectedBranchId).subscribe(() => {
      this.load();
    });
  }

  ngOnInit(): void {
    this.load();
    this.loadBranches();
    this.api.getProducts().subscribe({ next: (res) => this.products = res.items });
    
    this.sidebar.setActions([
      {
        label: 'Nueva Compra',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
        handler: () => this.openForm(),
        primary: true
      }
    ]);
  }

  ngOnDestroy(): void {
    this.sidebar.clear();
  }

  load() {
    this.loading = true;
    this.api.getPurchases(this.branchState.selectedBranchId() ?? undefined).subscribe({ 
      next: (p) => { this.purchases = p; this.loading = false; }, 
      error: () => this.loading = false 
    });
  }

  loadBranches() {
    this.api.getBranches().subscribe(branches => {
      this.branchItems = branches.map(b => ({ id: b.id, label: b.name, sublabel: b.address }));
    });
  }

  onBranchChange(branchId: string | undefined) {
    this.supplierId = '';
    if (branchId) {
      this.api.getSuppliers(branchId).subscribe(suppliers => {
        this.supplierItems = suppliers.map(s => ({ id: s.id, label: s.name, sublabel: s.contactName }));
      });
    } else {
      this.supplierItems = [];
    }
  }

  onOverlayClick() {
    if (this.showSupplierForm) {
      this.closeSupplierForm();
    } else if (this.showForm) {
      this.closeForm();
    }
  }

  openForm() {
    const trigger = document.querySelector('[data-flip-id="btn-new-purchase"]') as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = this.anime.getState(trigger);

    this.supplierId = ''; this.branchId = ''; this.notes = ''; this.items = []; this.subTotalAmount = 0; this.taxTotalAmount = 0; this.totalAmount = 0; this.error = '';
    this.showForm = true;
    
    requestAnimationFrame(() => {
      this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('.inline-form-panel:not(app-supplier-form .inline-form-panel)') as HTMLElement;
      
      if (panel) {
        this.anime.animateModal(panel, triggerRect);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  closeForm() {
    const state = this.anime.getState('[data-flip-id="btn-new-purchase"]');
    const panel = document.querySelector('.inline-form-panel:not(app-supplier-form .inline-form-panel)') as HTMLElement;

    this.anime.animateModalOut(panel)?.eventCallback('onComplete', () => {
      this.showForm = false;
      this.anime.from(state, { borderRadius: '20px' });
    });
  }

  openSupplierForm() {
    const trigger = document.querySelector('[data-flip-id="new-supplier-action"]') as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = this.anime.getState(trigger);

    this.showSupplierForm = true;
    requestAnimationFrame(() => {
      this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('app-supplier-form .inline-form-panel') as HTMLElement;
      if (panel) {
        this.anime.animateModal(panel, triggerRect);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  closeSupplierForm() {
    const state = this.anime.getState('[data-flip-id="new-supplier-action"]');
    const panel = document.querySelector('app-supplier-form .inline-form-panel') as HTMLElement;
    this.anime.animateModalOut(panel)?.eventCallback('onComplete', () => {
      this.showSupplierForm = false;
      this.anime.from(state, { borderRadius: '20px' });
    });
  }

  onSupplierCreated(s: Supplier) {
    this.closeSupplierForm();
    this.onBranchChange(this.branchId); // Reload suppliers for current branch
    this.supplierId = s.id;
  }

  addLine() { this.items.push({ productId: '', productName: '', isNew: false, quantity: 1, unitCost: 0, taxRate: 18 }); }
  removeLine(i: number) { this.items.splice(i, 1); this.updateTotal(); }
  updateTotal() {
    this.subTotalAmount = this.items.reduce((sum, l) => sum + (l.quantity * l.unitCost), 0);
    this.taxTotalAmount = this.items.reduce((sum, l) => sum + (l.quantity * l.unitCost * (l.taxRate / 100)), 0);
    this.totalAmount = this.subTotalAmount + this.taxTotalAmount;
  }

  toggleNewProduct(line: any) {
    line.isNew = !line.isNew;
    line.productId = '';
    line.productName = '';
  }

  isValid(): boolean {
    if (!this.branchId || !this.supplierId || this.items.length === 0) return false;
    for (const item of this.items) {
      if (item.isNew && !item.productName) return false;
      if (!item.isNew && !item.productId) return false;
      if (item.quantity <= 0 || item.unitCost < 0) return false;
    }
    return true;
  }

  save() {
    if (!this.isValid()) return;
    this.saving = true;

    const mappedItems: CreatePurchaseItem[] = this.items.map(i => {
      return {
        productId: i.isNew ? undefined : i.productId,
        productName: i.isNew ? i.productName : undefined,
        quantity: i.quantity,
        unitCost: i.unitCost,
        taxRate: i.taxRate
      };
    });

    const data: CreatePurchase = { 
        supplierId: this.supplierId, 
        branchId: this.branchId || undefined, 
        notes: this.notes, 
        items: mappedItems 
    };

    this.api.createPurchase(data).subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.api.getPurchases().subscribe(p => this.purchases = p);
      },
      error: () => {
        this.saving = false;
        this.error = 'Error al registrar la compra';
      }
    });
  }
}
