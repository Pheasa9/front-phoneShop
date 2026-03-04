import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Ensure this URL exactly matches your Spring Boot @PostMapping
  private apiUrl = 'http://carproject-t9tv.onrender.com'; 

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

// put inside AuthService class

getDecodedToken(): any | null {
  const token = this.getToken();
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error('❌ Cannot decode token', e);
    return null;
  }
}

getRole(): string | null {
  const payload = this.getDecodedToken();
  if (!payload) return null;

  // support many backend formats
  const role =
    payload.role ||
    payload.roles?.[0] ||
    payload.authorities?.[0] ||
    payload.authority ||
    payload.scopes?.[0] ||
    null;

  return role;
}

isAdmin(): boolean {
  const payload = this.getDecodedToken();
  if (!payload || !Array.isArray(payload.authorities)) return false;

  return payload.authorities.includes('ROLE_ADMIN');
}

isSale(): boolean {
  const payload = this.getDecodedToken();
  if (!payload || !Array.isArray(payload.authorities)) return false;

  // example sale role (adjust if needed)
  return payload.authorities.includes('ROLE_SALE');
}





  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

 // LOGOUT

public logout(): void {
  localStorage.removeItem('jwtToken');
  sessionStorage.clear();
}
}