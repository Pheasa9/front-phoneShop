import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'jwtToken';
  getCurrentUser: any;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<{ token: string }>('http://localhost:8080/login', { username, password })
      .pipe(
        tap(res => {
          console.log('Login success, storing token:', res.token);
          localStorage.setItem(this.tokenKey, res.token);
        })
      );
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('AuthService.getToken() ->', token);
    return token;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }
}
