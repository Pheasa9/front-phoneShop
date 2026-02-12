import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BrandDto {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class BrandAdminService {
  private baseUrl = 'http://localhost:8080/brands';
   private baseUrl2 = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // backend returns PageDto
  getBrands(page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<any>(this.baseUrl, { params });
  }

  // your backend filter returns a Stream (sometimes comes as array)
  filterByName(name: string): Observable<any> {
    const params = new HttpParams().set('name', name);
    return this.http.get<any>(`${this.baseUrl}/filter`, { params });
  }

  getOne(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  create(dto: BrandDto): Observable<any> {
    return this.http.post<any>(this.baseUrl, dto);
  }

  update(id: number, dto: BrandDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, dto);
  }
  // brand.service.ts (or wherever you put getModelsByBrand)
getModelsByBrand(brandId: number) {
  return this.http.get<any>(`${this.baseUrl2}/models`, {
    params: { brandId: String(brandId) }
  });
}



}
