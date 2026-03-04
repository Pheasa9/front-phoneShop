import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductDetailsDto {
  productId: number;
  productName: string;
  model: string;
  color: string;
  brand: string;

  salePrice: number;
  availableUnit: number;

  discountPrice?: number;
  description?: string;
  storage?: string;
  ram?: string;
  processor?: string;

  imagePath?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductDetailsService {
  // ✅ match your backend controller: @RequestMapping("/productDetails")
  private readonly baseUrl = 'http://carproject-t9tv.onrender.com/productDetails';

  constructor(private http: HttpClient) {}

  /** GET /productDetails/product/{productId} */
  getByProductId(productId: number): Observable<ProductDetailsDto> {
    return this.http.get<ProductDetailsDto>(`${this.baseUrl}/product/${productId}`);
  }

  /** POST /productDetails (create details) */
  create(details: Partial<ProductDetailsDto>): Observable<ProductDetailsDto> {
    return this.http.post<ProductDetailsDto>(`${this.baseUrl}`, details);
  }

  /** helper for image rendering from assets folder */
  assetImage(path?: string): string {
    if (!path) return '';
    return `assets/img/products/${path}`;
  }
}
