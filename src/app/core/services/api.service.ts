import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, LoginResponse,
  Client, CreateClient,
  Product, CreateProduct, UpdateProduct,
  Supplier, CreateSupplier,
  Branch, CreateBranch,
  Invoice, CreateInvoice,
  Purchase, CreatePurchase,
  InventoryTransaction,
  Dashboard, ReportSummary, PagedResult
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient) {}

  // ─── Auth ───────────────────────────────────────────────────────────────────
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, data);
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
  exportProductsExcel(): Observable<Blob> {
    return this.http.get(`${this.api}/products/export/excel`, { responseType: 'blob' });
  }
  exportProductsPdf(): Observable<Blob> {
    return this.http.get(`${this.api}/products/export/pdf`, { responseType: 'blob' });
  }

  // ─── Suppliers ──────────────────────────────────────────────────────────────
  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.api}/suppliers`);
  }
  getSupplier(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.api}/suppliers/${id}`);
  }
  createSupplier(data: CreateSupplier): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.api}/suppliers`, data);
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

  // ─── Invoices ───────────────────────────────────────────────────────────────
  getInvoices(page: number = 1, pageSize: number = 10, search?: string): Observable<PagedResult<Invoice>> {
    let url = `${this.api}/invoices?page=${page}&pageSize=${pageSize}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<PagedResult<Invoice>>(url);
  }
  getInvoice(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.api}/invoices/${id}`);
  }
  createInvoice(data: CreateInvoice): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.api}/invoices`, data);
  }
  exportInvoicesExcel(): Observable<Blob> {
    return this.http.get(`${this.api}/invoices/export/excel`, { responseType: 'blob' });
  }
  exportInvoicesPdf(): Observable<Blob> {
    return this.http.get(`${this.api}/invoices/export/pdf`, { responseType: 'blob' });
  }

  // ─── Purchases ──────────────────────────────────────────────────────────────
  getPurchases(): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.api}/purchases`);
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

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.api}/dashboard`);
  }

  // ─── Reports ────────────────────────────────────────────────────────────────
  getReportSummary(from: string, to: string): Observable<ReportSummary> {
    return this.http.get<ReportSummary>(`${this.api}/reports/summary?from=${from}&to=${to}`);
  }
  exportReportExcel(from: string, to: string): Observable<Blob> {
    return this.http.get(`${this.api}/reports/export?from=${from}&to=${to}`, { responseType: 'blob' });
  }
}
