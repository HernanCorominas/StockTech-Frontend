import { Injectable, signal, computed } from '@angular/core';
import { CreateProduct, CreateProductVariant, Product } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ProductCreationService {
  // The draft product being created or edited
  private draft = signal<Partial<CreateProduct>>({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    minStock: 0,
    initialStock: 0,
    categoryId: undefined,
    supplierId: undefined,
    branchId: undefined,
    variants: [],
    image: undefined
  });

  // Signals for the UI
  readonly productDraft = this.draft.asReadonly();
  
  // Computed values
  readonly margin = computed(() => {
    const d = this.draft();
    const cost = d.cost || 0;
    const price = d.price || 0;
    if (cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  });

  readonly hasImage = computed(() => !!this.draft().image);

  // Methods to update state
  updateField(field: keyof CreateProduct, value: any) {
    this.draft.update(d => ({ ...d, [field]: value }));
  }

  updateVariants(variants: CreateProductVariant[]) {
    this.draft.update(d => ({ ...d, variants }));
  }

  reset() {
    this.draft.set({
      name: '',
      description: '',
      price: 0,
      cost: 0,
      minStock: 0,
      initialStock: 0,
      variants: []
    });
  }

  setFromProduct(product: Product) {
    this.draft.set({
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: product.price,
      cost: product.cost,
      minStock: product.minStock,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      branchId: product.branchId,
      image: product.image
    });
  }
}
