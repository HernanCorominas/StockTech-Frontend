export interface ProductVariant {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface CreateProductVariant {
  size?: string;
  color?: string;
  sku: string;
  price: number;
  stock: number;
}

export interface UpdateProductVariant {
  id?: string;
  size?: string;
  color?: string;
  sku: string;
  price: number;
  stock: number;
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId?: string;
  categoryName?: string;
  isActive: boolean;
  lowStock: boolean;
  branchId: string;
  supplierId?: string;
  supplierName?: string;
  createdAt: string;
  variants: ProductVariant[];
  image?: string;
}

export interface CreateProduct {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost: number;
  minStock: number;
  initialStock?: number;
  categoryId?: string;
  variants?: CreateProductVariant[];
  branchId?: string;
  supplierId?: string;
  image?: string;
}

export interface UpdateProduct {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost: number;
  minStock: number;
  categoryId?: string;
  isActive: boolean;
  variants?: UpdateProductVariant[];
  branchId?: string;
  supplierId?: string;
  image?: string;
}
