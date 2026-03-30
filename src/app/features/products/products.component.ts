import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductWizardComponent } from './components/product-wizard/product-wizard.component';
import { StockAdjustmentComponent } from './components/stock-adjustment/stock-adjustment.component';
import { Product } from '../../core/models';
import { FlipAnimationService } from '../../core/services/flip-animation.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductListComponent, ProductWizardComponent, StockAdjustmentComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  private anime = inject(FlipAnimationService);
  private sidebar = inject(SidebarService);
  private router = inject(Router);
  private authState = inject(AuthStateService);

  showForm = signal(false);
  showAdjustment = signal(false);
  editProduct = signal<Product | null>(null);
  flipId = 'product-action';
  products: Product[] = [];

  ngOnInit() {
    const actions = [];

    if (!this.authState.isSeller()) {
      actions.push({
        label: 'Nuevo Producto',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>',
        handler: () => this.openForm(),
        primary: true
      });
      
      actions.push({
        label: 'Ajuste de Stock',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
        handler: () => this.openAdjustment()
      });
    }

    actions.push({
      label: 'Ver Historial Kardex',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      handler: () => this.router.navigate(['/products/movements'])
    });

    this.sidebar.setActions(actions);
  }

  ngOnDestroy() {
    this.sidebar.clear();
  }

  openForm() {
    const trigger = document.querySelector('[data-flip-id="product-action"]') as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = this.anime.getState(trigger);

    this.editProduct.set(null);
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

  openEdit(p: Product) {
    const trigger = document.querySelector(`[appFlipTrigger="product-row-${p.id}"]`) as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = this.anime.getState(trigger || '[data-flip-id="product-action"]');

    this.editProduct.set(p);
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

  openAdjustment() {
    const trigger = document.querySelector('[data-flip-id="product-action"]') as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = this.anime.getState(trigger);

    this.editProduct.set(null);
    this.showAdjustment.set(true);
    
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
    const state = this.anime.getState('[data-flip-id="product-action"]');
    const panel = document.querySelector('.inline-form-panel') as HTMLElement;
    
    this.anime.animateModalOut(panel)?.eventCallback('onComplete', () => {
      this.showForm.set(false);
      this.editProduct.set(null);
      this.anime.from(state, { borderRadius: '20px' });
    });
  }

  closeAdjustment() {
    const state = this.anime.getState('[data-flip-id="product-action"]');
    const panel = document.querySelector('.inline-form-panel') as HTMLElement;
    
    this.anime.animateModalOut(panel)?.eventCallback('onComplete', () => {
      this.showAdjustment.set(false);
      this.anime.from(state, { borderRadius: '20px' });
    });
  }

  closeAll() {
    if (this.showForm()) this.closeForm();
    if (this.showAdjustment()) this.closeAdjustment();
  }

  onSave() {
    this.closeForm();
  }

  onAdjustmentSaved() {
    this.closeAdjustment();
    // The product list will reload on next navigation or user action
  }
}
