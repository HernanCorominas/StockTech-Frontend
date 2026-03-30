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
