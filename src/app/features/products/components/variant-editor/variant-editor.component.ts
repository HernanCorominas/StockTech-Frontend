import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpdateProductVariant } from '../../../../core/models';

@Component({
  selector: 'app-variant-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './variant-editor.component.html',
  styleUrls: ['./variant-editor.component.scss']
})
export class VariantEditorComponent {
  @Input() variants: UpdateProductVariant[] = [];
  @Output() variantsChange = new EventEmitter<UpdateProductVariant[]>();

  add(): void {
    this.variants.push({ sku: '', size: '', color: '', price: 0, stock: 0, isActive: true });
    this.variantsChange.emit(this.variants);
  }

  remove(index: number): void {
    this.variants.splice(index, 1);
    this.variantsChange.emit(this.variants);
  }
}
