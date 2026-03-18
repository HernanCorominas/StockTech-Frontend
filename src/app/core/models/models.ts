export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
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
  supplier: string;
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
  supplier: string;
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
  supplier: string;
  purchaseDate: string;
  total: number;
}
