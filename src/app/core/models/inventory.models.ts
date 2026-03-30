export enum InvoiceStatus {
  Pending = 1,
  Paid = 2,
  Cancelled = 3
}

export enum TransactionType {
  Purchase = 1,
  Sale = 2,
  Adjustment = 3,
  Transfer = 4
}

export interface InvoiceItem {
  id: string;
  productId: string;
  variantId?: string;
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
  isLoadingPdf?: boolean;
}

export interface CreateInvoiceItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateInvoice {
  clientId?: string | null;
  customerName?: string;
  customerDocument?: string;
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
  productId?: string;
  productName?: string;
  categoryId?: string;
  sku?: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchase {
  supplierId: string;
  branchId?: string;
  items: CreatePurchaseItem[];
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName?: string;
  variantId?: string;
  variantName?: string;
  type: number;
  typeName?: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceNumber?: string;
  transactionDate: string;
  invoiceId?: string;
  purchaseId?: string;
  branchId?: string;
  branchName?: string;
  userId?: string;
  userName?: string;
}

export type StockMovement = InventoryTransaction;
