import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.scss'
})
export class ProductGridComponent {
  @Input() products: Product[] = [];
  @Output() add = new EventEmitter<Product>();

  // Optional: internal search filtering
  searchTerm = '';
  selectedCategory = 'All';

  get filteredProducts() {
    return this.products.filter(p => {
       const matchSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                           (p.sku && p.sku.toLowerCase().includes(this.searchTerm.toLowerCase()));
       const matchCat = this.selectedCategory === 'All' || p.categoryName === this.selectedCategory;
       return matchSearch && matchCat;
    });
  }
}
