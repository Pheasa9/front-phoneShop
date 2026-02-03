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

  /** * PRODUCT LOGIC 
   */

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API}/products`);
  }

  // Filter products by brand
  // product.service.ts

getProductsFiltered(brandName?: string): Observable<any[]> {
  // If brandName is empty or 'all', get all products
  if (!brandName || brandName === 'all' || brandName === '') {
    return this.getProducts();
  }

  // This builds: localhost:8080/products/filter?brandName=Oppo
  const params = new HttpParams().set('brandName', brandName);
  return this.http.get<any[]>(`${this.API}/products/filter`, { params });
}
  /** * BRAND LOGIC 
   */

  // Get all brands
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.API}/brands`);
  }

  /** * CHECKOUT / SALE LOGIC 
   * Connects to your SaleColtroller @PostMapping
   */

  // Sends the SaleDto to the backend
  checkout(saleDto: any): Observable<any> {
    return this.http.post(`${this.API}/sales`, saleDto);
  }

  // Optional: Get a specific sale by ID (Connects to your @GetMapping("/{id}"))
  getSaleById(id: number): Observable<any> {
    return this.http.get(`${this.API}/sales/${id}`);
  }

  // Optional: Cancel a sale (Connects to your @PutMapping("/{saleId}/cancel"))
  cancelSale(saleId: number): Observable<any> {
    return this.http.put(`${this.API}/sales/${saleId}/cancel`, {});
  }
}