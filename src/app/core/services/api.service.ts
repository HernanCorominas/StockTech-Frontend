import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, LoginResponse,
  Client, CreateClient,
  Product, CreateProduct, UpdateProduct,
  Invoice, CreateInvoice,
  Purchase, CreatePurchase,
  Dashboard, ReportSummary
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = environment.apiUrl;

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
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/products`);
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

  // ─── Invoices ───────────────────────────────────────────────────────────────
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.api}/invoices`);
  }
  getInvoice(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.api}/invoices/${id}`);
  }
  createInvoice(data: CreateInvoice): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.api}/invoices`, data);
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
