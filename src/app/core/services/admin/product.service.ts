import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductAdminService {
  private baseUrl = 'http://carproject-t9tv.onrender.com/products';

  constructor(private http: HttpClient) {}

  // GET /products/filter?name=..&brandName=..
  filterProducts(paramsObj: any): Observable<any[]> {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach(k => {
      const v = paramsObj[k];
      if (v !== null && v !== undefined && v !== '') {
        params = params.set(k, v);
      }
    });
    return this.http.get<any[]>(`${this.baseUrl}/filter`, { params });
  }

  // POST /products   (ProductDto: modelId, colorId)
  createProduct(payload: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }

  // ✅ NEW: POST /products/with-image  (multipart/form-data)
  // FormData must include: modelId, colorId, file
  createProductWithImage(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/with-image`, formData);
  }

  // POST /products/importProduct
  importStock(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/importProduct`, payload);
  }

  // POST /products/{id}/price  (SetPriceDto)
  setPrice(productId: number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${productId}/price`, payload);
  }

  // POST /products/uploads  (multipart file)
  uploadExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/uploads`, formData);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
