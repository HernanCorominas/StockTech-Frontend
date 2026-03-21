export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName?: string;
  email?: string;
  role: string;
  expiresAt: string;
}

export interface AuthState {
  username: string;
  role: string;
  fullName?: string;
  email?: string;
  permissions: string[];
}

export interface Client {
  id: string;
  name: string;
  document: string;
  clientType: number;
  clientTypeName: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateClient {
  name: string;
  document: string;
  clientType: number;
  email?: string;
  phone?: string;
  address?: string;
}

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

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category?: string;
  isActive: boolean;
  lowStock: boolean;
  createdAt: string;
  variants: ProductVariant[];
}

export interface CreateProduct {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category?: string;
  variants?: CreateProductVariant[];
}

export interface UpdateProduct {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost: number;
  minStock: number;
  category?: string;
  isActive: boolean;
  variants?: CreateProductVariant[];
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  taxId: string;
  createdAt: string;
}

export interface CreateSupplier {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  taxId: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerName: string;
  createdAt: string;
}

export interface CreateBranch {
  name: string;
  address: string;
  phone: string;
  managerName: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientDocument: string;
  branchId?: string;
  branchName?: string;
  invoiceDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: number;
  statusName: string;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface CreateInvoiceItem {
  productId: string;
  quantity: number;
}

export interface CreateInvoice {
  clientId: string;
  branchId?: string;
  items: CreateInvoiceItem[];
  taxRate: number;
  notes?: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId?: string;
  supplierName: string;
  branchId?: string;
  branchName?: string;
  purchaseDate: string;
  total: number;
  notes?: string;
  items: PurchaseItem[];
  createdAt: string;
}

export interface CreatePurchaseItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchase {
  supplierId: string;
  branchId?: string;
  items: CreatePurchaseItem[];
  notes?: string;
}

export interface MonthlySummary {
  month: string;
  total: number;
}

export interface TopProduct {
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface CategoryStock {
  category: string;
  stockCount: number;
}

export interface BranchSales {
  branchName: string;
  totalSales: number;
}

export interface Dashboard {
  totalSales: number;
  totalPurchases: number;
  totalInvoices: number;
  totalPurchasesCount: number;
  totalClients: number;
  totalProducts: number;
  lowStockProducts: number;
  profit: number;
  monthlySales: MonthlySummary[];
  monthlyPurchases: MonthlySummary[];
  topProducts: TopProduct[];
  categoryDistribution: CategoryStock[];
  branchSales: BranchSales[];
}

export interface ReportSummary {
  totalSales: number;
  totalPurchases: number;
  netProfit: number;
  sales: SalesReportItem[];
  purchases: PurchaseReportItem[];
}

export interface SalesReportItem {
  invoiceNumber: string;
  clientName: string;
  invoiceDate: string;
  total: number;
}

export interface PurchaseReportItem {
  purchaseNumber: string;
  supplierName: string;
  purchaseDate: string;
  total: number;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: number;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceNumber?: string;
  transactionDate: string;
  invoiceId?: string;
  purchaseId?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
