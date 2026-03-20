import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateProductVariant } from '../../../../core/models/models';

@Component({
  selector: 'app-variant-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="variant-editor">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
    <label class="fw-bold">Variantes de Producto (Talla, Color, etc.)</label>
    <button type="button" class="btn btn--secondary" style="padding:4px 8px; font-size:0.8rem" (click)="add()">+ Agregar Variante</button>
  </div>

  <div class="card" style="padding:10px; background:#f9f9f9" *ngIf="variants.length > 0">
    <table class="data-table data-table--compact">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Talla</th>
          <th>Color</th>
          <th>Precio</th>
          <th>Stock</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let v of variants; let i = index">
          <td><input [(ngModel)]="v.sku" placeholder="SKU-VAR" style="width:100%" /></td>
          <td><input [(ngModel)]="v.size" placeholder="L, XL, 32" style="width:100%" /></td>
          <td><input [(ngModel)]="v.color" placeholder="Rojo, Azul" style="width:100%" /></td>
          <td><input type="number" [(ngModel)]="v.price" style="width:80px" /></td>
          <td><input type="number" [(ngModel)]="v.stock" style="width:60px" /></td>
          <td><button type="button" class="btn btn--danger" style="padding:4px" (click)="remove(i)">✕</button></td>
        </tr>
      </tbody>
    </table>
  </div>
  <p *ngIf="variants.length === 0" class="text-muted" style="font-size:0.85rem; font-style:italic">
    Sin variantes. El producto se tratará como un ítem simple.
  </p>
</div>
  `,
  styles: [`
    .data-table--compact { font-size: 0.85rem; }
    .data-table--compact input { padding: 4px; border: 1px solid #ddd; border-radius: 4px; }
  `]
})
export class VariantEditorComponent {
  @Input() variants: CreateProductVariant[] = [];
  @Output() variantsChange = new EventEmitter<CreateProductVariant[]>();

  add(): void {
    this.variants.push({ sku: '', size: '', color: '', price: 0, stock: 0 });
    this.variantsChange.emit(this.variants);
  }

  remove(index: number): void {
    this.variants.splice(index, 1);
    this.variantsChange.emit(this.variants);
  }
}
