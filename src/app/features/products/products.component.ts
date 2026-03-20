import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { Product } from '../../core/models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductListComponent, ProductFormComponent],
  template: `
    <div>
      <app-product-list #list (onCreate)="openCreate()" (onEdit)="openEdit($event)"></app-product-list>
      <app-product-form *ngIf="showForm" [editProduct]="selectedProduct" (onSave)="onSave()" (onCancel)="showForm = false"></app-product-form>
    </div>
  `
})
export class ProductsComponent {
  showForm = false;
  selectedProduct: Product | null = null;

  openCreate() {
    this.selectedProduct = null;
    this.showForm = true;
  }

  openEdit(p: Product) {
    this.selectedProduct = p;
    this.showForm = true;
  }

  onSave() {
    this.showForm = false;
    // We need to trigger the list refresh. 
    // Usually via a Shared Service or ViewChild, but for now a simple refresh or EventBus.
    window.location.reload(); // Simple refresh for this sprint step, will optimize in Sprint 5 with Signals.
  }
}
