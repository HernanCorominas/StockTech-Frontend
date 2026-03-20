import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product, CreateProduct, UpdateProduct, PagedResult, InventoryTransaction } from '../../../core/models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = `${environment.apiUrl}/v1/products`;
  private invApi = `${environment.apiUrl}/v1/inventory`;

  constructor(private http: HttpClient) {}

  getProducts(page: number = 1, pageSize: number = 10, search?: string): Observable<PagedResult<Product>> {
    let url = `${this.api}?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<PagedResult<Product>>(url);
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
}
