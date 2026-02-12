import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // admin safety
    if (!this.auth.getToken() || !this.auth.isAdmin()) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
