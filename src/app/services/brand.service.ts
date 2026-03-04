import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  // Matches your Spring Security requestMatcher("/brands")
  private apiUrl = 'https://carproject-t9tv.onrender.com/brands';

  constructor(private http: HttpClient) {}

  getBrands(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}