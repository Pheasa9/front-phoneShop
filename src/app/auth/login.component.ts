import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="auth-container">
      <div class="login-card shadow">
        <h2 class="text-center mb-4">Welcome Back</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label>Username</label>
            <input type="text" class="form-control" [(ngModel)]="username" name="username" required>
          </div>
          <div class="mb-3">
            <label>Password</label>
            <input type="password" class="form-control" [(ngModel)]="password" name="password" required>
          </div>
          <button type="submit" class="btn btn-primary w-100">Login</button>
          

        </form>
        <div *ngIf="error" class="alert alert-danger mt-3">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: #f4f7f6; }
    .login-card { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 400px; }
  `]
})
export class LoginComponent {
  username = ''; password = ''; error = '';

  constructor(public auth: AuthService, private router: Router) {}

  onSubmit() {
  this.error = '';
  
  // LOG DATA BEFORE SENDING
  console.log('--- LOGIN FORM DATA ---');
  console.log('Username:', this.username);
  console.log('Password:', this.password);
  console.log('-----------------------');

  this.auth.login(this.username, this.password).subscribe({
    next: () => {
  const decoded = this.auth.getDecodedToken();
  console.log('✅ Decoded token:', decoded);

  if (this.auth.isAdmin()) {
    this.router.navigate(['/admin/dashboard']);
  } else {
    // SALE / USER
    this.router.navigate(['/brands']); // or '/profile'
  }
},

    error: (err) => {
      console.error('❌ Login Error:', err);
      this.error = 'Invalid credentials.';
    }
  });
}
}