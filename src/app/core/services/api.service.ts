import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, LoginResponse,
  Client, CreateClient,
  Product, CreateProduct, UpdateProduct, ProductVariant,
  Supplier, CreateSupplier,
  Branch, CreateBranch,
  Invoice, CreateInvoice,
  Purchase, CreatePurchase,
  InventoryTransaction, AuditLog,
  Dashboard, ReportSummary, PagedResult,
  User, Role, TransactionType
} from '../models';

export interface ManualStockAdjustment {
  productId: string;
  variantId?: string;
  quantity: number;          // positive = entry, negative = exit
  type: TransactionType;     // 1=Purchase, 2=Sale, 3=Adjustment, 4=Transfer
  referenceNumber?: string;
  branchId?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient) {}

  // ─── Auth ───────────────────────────────────────────────────────────────────
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, data);
  }

  verifyPassword(password: string): Observable<{isValid: boolean}> {
    return this.http.post<{isValid: boolean}>(`${this.api}/auth/verify-password`, { password });
  }

  // ─── Clients ────────────────────────────────────────────────────────────────
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.api}/clients`);
  }
  getClient(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.api}/clients/${id}`);
  }
  createClient(data: CreateClient): Observable<Client> {
    return this.http.post<Client>(`${this.api}/clients`, data);
  }
  updateClient(id: string, data: CreateClient): Observable<Client> {
    return this.http.put<Client>(`${this.api}/clients/${id}`, data);
  }

  // ─── Products ───────────────────────────────────────────────────────────────
  getProducts(page: number = 1, pageSize: number = 10, search?: string): Observable<PagedResult<Product>> {
    let url = `${this.api}/products?page=${page}&pageSize=${pageSize}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<PagedResult<Product>>(url);
  }
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.api}/products/${id}`);
  }
  createProduct(data: CreateProduct): Observable<Product> {
    return this.http.post<Product>(`${this.api}/products`, data);
  }
  updateProduct(id: string, data: UpdateProduct): Observable<Product> {
    return this.http.put<Product>(`${this.api}/products/${id}`, data);
  }
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/products/${id}`);
  }
  getProductVariants(productId: string): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.api}/products/${productId}/variants`);
  }
  exportProductsExcel(): Observable<Blob> {
    return this.http.get(`${this.api}/products/export/excel`, { responseType: 'blob' });
  }
  exportProductsPdf(): Observable<Blob> {
    return this.http.get(`${this.api}/products/export/pdf`, { responseType: 'blob' });
  }

  // ─── Product Variants ───────────────────────────────────────────────────────
  createProductVariant(productId: string, data: ProductVariant): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(`${this.api}/products/${productId}/variants`, data);
  }
  updateProductVariant(productId: string, variantId: string, data: ProductVariant): Observable<ProductVariant> {
    return this.http.put<ProductVariant>(`${this.api}/products/${productId}/variants/${variantId}`, data);
  }
  deleteProductVariant(productId: string, variantId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/products/${productId}/variants/${variantId}`);
  }

  // ─── Suppliers ──────────────────────────────────────────────────────────────
  getSuppliers(branchId?: string): Observable<Supplier[]> {
    let url = `${this.api}/suppliers`;
    if (branchId) url += `?branchId=${branchId}`;
    return this.http.get<Supplier[]>(url);
  }
  getSupplier(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.api}/suppliers/${id}`);
  }
  createSupplier(data: CreateSupplier): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.api}/suppliers`, data);
  }
  updateSupplier(id: string, data: CreateSupplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.api}/suppliers/${id}`, data);
  }
  deleteSupplier(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/suppliers/${id}`);
  }

  // ─── Branches ───────────────────────────────────────────────────────────────
  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.api}/branches`);
  }
  getBranch(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.api}/branches/${id}`);
  }
  createBranch(data: CreateBranch): Observable<Branch> {
    return this.http.post<Branch>(`${this.api}/branches`, data);
  }
  updateBranch(id: string, data: CreateBranch): Observable<Branch> {
    return this.http.put<Branch>(`${this.api}/branches/${id}`, data);
  }
  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/branches/${id}`);
  }

  // ─── Invoices ───────────────────────────────────────────────────────────────
  getInvoices(page: number = 1, pageSize: number = 10, search?: string, branchId?: string): Observable<PagedResult<Invoice>> {
    let url = `${this.api}/invoices?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (branchId) url += `&branchId=${branchId}`;
    return this.http.get<PagedResult<Invoice>>(url);
  }
  getInvoice(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.api}/invoices/${id}`);
  }
  createInvoice(data: CreateInvoice): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.api}/invoices`, data);
  }
  cancelInvoice(id: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/invoices/${id}/cancel`, {});
  }
  exportInvoicesExcel(): Observable<Blob> {
    return this.http.get(`${this.api}/invoices/export/excel`, { responseType: 'blob' });
  }
  exportInvoicesPdf(): Observable<Blob> {
    return this.http.get(`${this.api}/invoices/export/pdf`, { responseType: 'blob' });
  }
  getInvoicePdfUrl(id: string): Observable<{url: string}> {
    return this.http.get<{url: string}>(`${this.api}/invoices/${id}/download`);
  }

  downloadDocument(fileUrl: string): Observable<Blob> {
    return this.http.get(`${this.api}/documents/download?fileUrl=${encodeURIComponent(fileUrl)}`, { responseType: 'blob' });
  }

  // ─── System Settings ───────────────────────────────────────────────────────
  getSystemSettings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/systemsettings`);
  }

  // ─── Purchases ──────────────────────────────────────────────────────────────
  getPurchases(branchId?: string): Observable<Purchase[]> {
    let url = `${this.api}/purchases`;
    if (branchId) url += `?branchId=${branchId}`;
    return this.http.get<Purchase[]>(url);
  }
  getPurchase(id: string): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.api}/purchases/${id}`);
  }
  createPurchase(data: CreatePurchase): Observable<Purchase> {
    return this.http.post<Purchase>(`${this.api}/purchases`, data);
  }

  // ─── Inventory ──────────────────────────────────────────────────────────────
  getKardex(productId: string): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.api}/inventory/kardex/${productId}`);
  }
  getInventoryTransactions(branchId?: string, productId?: string): Observable<InventoryTransaction[]> {
    let url = `${this.api}/inventory/transactions?`;
    if (branchId) url += `branchId=${branchId}&`;
    if (productId) url += `productId=${productId}&`;
    return this.http.get<InventoryTransaction[]>(url);
  }
  createStockAdjustment(data: ManualStockAdjustment): Observable<void> {
    return this.http.post<void>(`${this.api}/inventory/adjust`, data);
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard(branchId?: string): Observable<Dashboard> {
    let url = `${this.api}/dashboard`;
    if (branchId) url += `?branchId=${branchId}`;
    return this.http.get<Dashboard>(url);
  }

  // ─── Reports ────────────────────────────────────────────────────────────────
  getReportSummary(from: string, to: string, branchId?: string): Observable<ReportSummary> {
    let url = `${this.api}/reports/summary?from=${from}&to=${to}`;
    if (branchId) url += `&branchId=${branchId}`;
    return this.http.get<ReportSummary>(url);
  }
  exportReportExcel(from: string, to: string, branchId?: string): Observable<Blob> {
    let url = `${this.api}/reports/export?from=${from}&to=${to}`;
    if (branchId) url += `&branchId=${branchId}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  // ─── Users ────────────────────────────────────────────────────────────────
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`);
  }
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.api}/users/${id}`);
  }
  createUser(data: any): Observable<User> {
    return this.http.post<User>(`${this.api}/users`, data);
  }
  updateUser(id: string, data: any): Observable<void> {
    return this.http.put<void>(`${this.api}/users/${id}`, data);
  }
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/users/${id}`);
  }

  // ─── Roles ─────────────────────────────────────────────────────────────────
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.api}/roles`);
  }

  getPermissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/roles/permissions`);
  }

  createRole(data: any): Observable<Role> {
    return this.http.post<Role>(`${this.api}/roles`, data);
  }

  updateRole(id: string, data: any): Observable<void> {
    return this.http.put<void>(`${this.api}/roles/${id}`, data);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/roles/${id}`);
  }

  // ─── Audit Logs ─────────────────────────────────────────────────────────────
  getAuditLogs(start?: string, end?: string): Observable<AuditLog[]> {
    const params: any = {};
    if (start) params.start = start;
    if (end) params.end = end;
    return this.http.get<AuditLog[]>(`${this.api}/AuditLogs`, { params });
  }
}
