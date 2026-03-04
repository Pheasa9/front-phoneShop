import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ColorDto {
  id?: number;        // if backend uses "id"
  name?: string;      // if backend uses "name"
  colorId?: number;   // if backend uses "colorId"
  colorName?: string; // if backend uses "colorName"
}

@Injectable({ providedIn: 'root' })
export class ColorAdminService {
  private baseUrl = 'http://carproject-t9tv.onrender.com/colors';

  constructor(private http: HttpClient) {}

  // ✅ GET all colors
  getColors(): Observable<ColorDto[]> {
    return this.http.get<ColorDto[]>(this.baseUrl);
  }

  // ✅ CREATE color (optional)
  createColor(payload: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }

  // ✅ UPDATE color (optional)
  updateColor(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }
}
