import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ModelDto {
  name: string;
  brandId: number;
}

@Injectable({ providedIn: 'root' })
export class ModelAdminService {
  private baseUrl = 'http://localhost:8080/models';

  constructor(private http: HttpClient) {}

  getModels(paramsObj: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach(k => {
      const v = paramsObj[k];
      if (v !== null && v !== undefined && v !== '') {
        params = params.set(k, v);
      }
    });
    return this.http.get<any>(this.baseUrl, { params });
  }
    getModelsByBrand(brandId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?brandId=${brandId}`);
  }
  create(dto: ModelDto): Observable<any> {
    return this.http.post<any>(this.baseUrl, dto);
  }

  update(id: number, dto: ModelDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}`, dto);
  }
}
