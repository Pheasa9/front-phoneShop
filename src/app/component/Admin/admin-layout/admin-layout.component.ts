import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('pageRef', { static: false }) pageRef!: ElementRef;

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  unreadCount: number = 0;
  profileOpen = false;
  private pollTimer: any = null;
  private routeSub: any = null;
  private readonly API = 'http://carproject-t9tv.onrender.com/notifications';

  ngOnInit(): void {
    // admin safety
    if (!this.auth.getToken() || !this.auth.isAdmin()) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    // load unread count immediately, then poll every 15s
    this.loadUnreadCount();
    this.pollTimer = setInterval(() => this.loadUnreadCount(), 15000);

    // smooth page transition on route change
    this.routeSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const el = this.pageRef?.nativeElement;
        if (el) {
          el.classList.remove('route-animate');
          void el.offsetWidth; // force reflow
          el.classList.add('route-animate');
        }
      });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  loadUnreadCount(): void {
    this.http.get<any[]>(this.API).subscribe({
      next: (data) => {
        this.unreadCount = (data || []).filter(n => !n.readStatus).length;
        console.log('Notification count:', this.unreadCount);
      },
      error: (err) => console.error('Notification fetch error:', err)
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  // Close dropdown on outside click
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (this.profileOpen && !target.closest('.tb-profile-wrap')) {
      this.profileOpen = false;
    }
  }

  toggleProfileMenu() {
    this.profileOpen = !this.profileOpen;
  }

}
