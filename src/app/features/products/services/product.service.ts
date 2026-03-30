import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product, CreateProduct, UpdateProduct, PagedResult, InventoryTransaction } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = `${environment.apiUrl}/v1/products`;
  private invApi = `${environment.apiUrl}/v1/inventory`;

  constructor(private http: HttpClient) {}

  getProducts(page: number, pageSize: number, search?: string, filters: any = {}): Observable<PagedResult<Product>> {
    let params = `?page=${page}&pageSize=${pageSize}`;
    if (search) params += `&search=${encodeURIComponent(search)}`;
    
    Object.keys(filters).forEach(key => {
      const val = filters[key];
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          val.forEach(v => params += `&${key}=${encodeURIComponent(v)}`);
        } else {
          params += `&${key}=${encodeURIComponent(val)}`;
        }
      }
    });

    return this.http.get<PagedResult<Product>>(`${this.api}${params}`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.api}/${id}`);
  }

  createProduct(data: CreateProduct): Observable<Product> {
    return this.http.post<Product>(this.api, data);
  }

  updateProduct(id: string, data: UpdateProduct): Observable<Product> {
    return this.http.put<Product>(`${this.api}/${id}`, data);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getKardex(productId: string): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.invApi}/kardex/${productId}`);
  }

  getTransactions(params: any): Observable<InventoryTransaction[]> {
    let url = `${this.invApi}/transactions?`;
    if (params.branchId) url += `branchId=${params.branchId}&`;
    if (params.productId) url += `productId=${params.productId}&`;
    if (params.startDate) url += `startDate=${params.startDate}&`;
    if (params.endDate) url += `endDate=${params.endDate}&`;
    if (params.type) url += `type=${params.type}&`;
    if (params.userId) url += `userId=${params.userId}&`;
    return this.http.get<InventoryTransaction[]>(url);
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.api}/export/excel`, { responseType: 'blob' });
  }

  exportPdf(): Observable<Blob> {
    return this.http.get(`${this.api}/export/pdf`, { responseType: 'blob' });
  }
}
