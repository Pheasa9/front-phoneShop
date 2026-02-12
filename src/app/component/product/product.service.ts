import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand, Product } from '../../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  // Change this to match your backend port/URL
  private API = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // ===================== PRODUCT =====================

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API}/products`);
  }

  // Filter products by brand name (query param)
  getProductsFiltered(brandName?: string): Observable<Product[]> {
    // If brandName is empty or 'all', get all products
    if (!brandName || brandName === 'all' || brandName.trim() === '') {
      return this.getProducts();
    }

    // Builds: /products/filter?brandName=Oppo
    const params = new HttpParams().set('brandName', brandName);
    return this.http.get<Product[]>(`${this.API}/products/filter`, { params });
  }

  // ===================== BRAND =====================

  // Get all brands
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.API}/brands`);
  }

  // ===================== SALES / CHECKOUT =====================

  // Normal checkout (no ABA)
  checkout(saleDto: any): Observable<any> {
    return this.http.post(`${this.API}/sales`, saleDto);
  }

  // Pay with ABA (generate QR)
  payWithAba(saleDto: any): Observable<any> {
    return this.http.post(`${this.API}/sales/pay`, saleDto);
  }

  // Get sale status (for polling)
  getSale(id: number): Observable<any> {
    return this.http.get(`${this.API}/sales/${id}`);
  }

  // Cancel sale
  cancelSale(saleId: number): Observable<any> {
    return this.http.put(`${this.API}/sales/${saleId}/cancel`, {});
  }
}
