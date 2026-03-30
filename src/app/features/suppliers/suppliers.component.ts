import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FlipAnimationService } from '../../core/services/flip-animation.service';
import { ToastService } from '../../core/services/toast.service';
import { BranchStateService } from '../../core/services/branch-state.service';
import { Supplier, CreateSupplier } from '../../core/models';
import { FlipTriggerDirective } from '../../shared/directives/flip-trigger.directive';
import { SharedDropdownComponent, DropdownItem } from '../../shared/components/shared-dropdown/shared-dropdown.component';
import { SupplierFormComponent } from './components/supplier-form/supplier-form.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, FlipTriggerDirective, SharedDropdownComponent, SupplierFormComponent],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {
  private api = inject(ApiService);
  private anime = inject(FlipAnimationService);
  private toast = inject(ToastService);
  public branchState = inject(BranchStateService);
  private sidebar = inject(SidebarService);

  @ViewChildren('row') rows!: QueryList<ElementRef>;

  suppliers: Supplier[] = [];
  loading = true;
  showForm = false;
  selectedSupplier: Supplier | null = null;
  selectedId = '';
  saving = false;

  constructor() {
    toObservable(this.branchState.selectedBranchId).subscribe(() => {
      this.loadSuppliers();
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.showForm) return;
    const panel = document.querySelector('app-supplier-form .inline-form-panel');
    if (panel && !panel.contains(event.target as Node) && !(event.target as HTMLElement).classList.contains('btn')) {
      this.closeForm();
    }
  }

  ngOnInit(): void { 
    this.loadSuppliers();
    this.sidebar.setActions([
      {
        label: 'Nuevo Suplidor',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><path d="M7.5 4.21l4.5 2.6 4.5-2.6"></path><path d="M7.5 19.79l4.5-2.6 4.5 2.6"></path><path d="M3.27 6.96L12 12.01l8.73-5.05"></path><path d="M12 22.08V12"></path></svg>',
        handler: () => this.openForm(),
        primary: true
      }
    ]);
  }

  ngOnDestroy(): void {
    this.sidebar.clear();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.api.getSuppliers().subscribe({
      next: (s) => { 
        this.suppliers = s; 
        this.loading = false;
        requestAnimationFrame(() => {
          this.anime.staggerIn(this.rows.map(r => r.nativeElement));
        });
      },
      error: () => this.loading = false
    });
  }

  openForm() {
    const state = this.anime.getState('[data-flip-id="supplier-action"]');
    this.selectedSupplier = null;
    this.showForm = true;
    
    requestAnimationFrame(() => {
      this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('app-supplier-form .inline-form-panel') as HTMLElement;
      
      if (panel) {
        this.anime.animateModal(panel);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  editSupplier(s: Supplier) {
    const state = this.anime.getState('[data-flip-id="supplier-action"]');
    this.selectedSupplier = s;
    this.showForm = true;
    
    requestAnimationFrame(() => {
      this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('app-supplier-form .inline-form-panel') as HTMLElement;
      
      if (panel) {
        this.anime.animateModal(panel);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  closeForm() {
    const state = this.anime.getState('[data-flip-id="supplier-action"]');
    const panel = document.querySelector('app-supplier-form .inline-form-panel') as HTMLElement;
    
    if (panel) {
      this.anime.animateModalOut(panel)?.eventCallback('onComplete', () => {
        this.showForm = false;
        this.selectedSupplier = null;
        this.anime.from(state, { borderRadius: '20px' });
      });
    } else {
      this.showForm = false;
    }
  }

  onSupplierSaved(s: Supplier) {
    this.closeForm();
    this.loadSuppliers();
  }
}
