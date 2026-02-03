import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Ensure this URL exactly matches your Spring Boot @PostMapping
  private apiUrl = 'http://localhost:8080'; 

  constructor(private http: HttpClient) {}

 // auth.service.ts
// auth.service.ts
login(username: string, password: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, 
    { username, password }, 
    { observe: 'response' } // 👈 CRITICAL: Tells Angular to include headers
  )
  .pipe(
    tap((fullResponse: any) => {
      // 1. Log headers to see exactly what the backend sent
      console.log('All Headers:', fullResponse.headers.keys());

      // 2. Look for the Authorization header
      let authHeader = fullResponse.headers.get('Authorization');

      if (authHeader) {
        // Remove "Bearer " prefix if it exists
        const token = authHeader.replace('Bearer ', '');
        localStorage.setItem('jwtToken', token);
        console.log('✅ Token extracted from Header and saved!');
      } else {
        console.error('❌ Login successful, but "Authorization" header was missing!');
      }
    })
  );
}

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  public logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.clear();
  }
}