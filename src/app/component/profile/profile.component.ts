import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userName: string = '';
  role: string = '';
  loading: boolean = true;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = this.auth.getToken();
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.sub || 'User';
        this.role = payload.role || 'Member';
        this.loading = false;
      } catch (e) {
        this.onLogout();
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']).then(() => {
      window.location.reload(); // Ensures the next login starts fresh
    });
  }
}