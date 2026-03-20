import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, CreateProduct, UpdateProduct, CreateProductVariant } from '../../../../core/models/models';
import { VariantEditorComponent } from '../../components/variant-editor/variant-editor.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, VariantEditorComponent],
  template: `
<div class="modal-overlay" (click)="onCancel.emit()">
  <div class="modal" (click)="$event.stopPropagation()" style="max-width: 800px">
    <h3>{{ editProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
    <div *ngIf="error" class="alert alert--error">{{ error }}</div>

    <div class="form-row">
      <div class="form-group">
        <label>Nombre *</label>
        <input [(ngModel)]="form.name" placeholder="Nombre del producto" />
      </div>
      <div class="form-group">
        <label>SKU Base</label>
        <input [(ngModel)]="form.sku" placeholder="PROD-001" />
      </div>
    </div>

    <div class="form-group">
      <label>Descripción</label>
      <textarea [(ngModel)]="form.description" placeholder="Descripción del producto"></textarea>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Precio Base (RD$) *</label>
        <input type="number" [(ngModel)]="form.price" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label>Costo (RD$) *</label>
        <input type="number" [(ngModel)]="form.cost" placeholder="0.00" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Stock Total</label>
        <input type="number" [(ngModel)]="form.stock" [disabled]="form.variants.length > 0" />
      </div>
      <div class="form-group">
        <label>Stock Mínimo</label>
        <input type="number" [(ngModel)]="form.minStock" placeholder="0" />
      </div>
    </div>

    <!-- Variant Manager -->
    <div style="margin-top:20px; border-top:1px solid #eee; padding-top:20px">
        <app-variant-editor [(variants)]="form.variants"></app-variant-editor>
    </div>

    <div class="modal__footer">
      <button class="btn btn--secondary" (click)="onCancel.emit()">Cancelar</button>
      <button class="btn btn--primary" (click)="save()" [disabled]="saving">
        {{ saving ? 'Guardando...' : (editProduct ? 'Actualizar' : 'Crear Producto') }}
      </button>
    </div>
  </div>
</div>
  `
})
export class ProductFormComponent {
  @Input() editProduct: Product | null = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  form: any = { 
    name: '', sku: '', description: '', price: 0, cost: 0, stock: 0, minStock: 0, category: '', isActive: true,
    variants: [] 
  };
  
  saving = false;
  error = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    if (this.editProduct) {
      this.form = { 
        ...this.editProduct,
        variants: this.editProduct.variants?.map(v => ({...v})) || []
      };
    }
  }

  save(): void {
    if (!this.form.name) { this.error = 'El nombre es requerido.'; return; }
    this.saving = true;
    this.error = '';

    const obs = this.editProduct
      ? this.productService.updateProduct(this.editProduct.id, this.form)
      : this.productService.createProduct(this.form);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.onSave.emit();
      },
      error: (e) => {
        this.error = e.error?.message ?? 'Error al guardar.';
        this.saving = false;
      }
    });
  }
}
