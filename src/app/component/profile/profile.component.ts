import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { PurchaseHistoryService, PurchaseRecord } from '../../services/purchase-history.service';

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
  profilePic: string | null = null;

  recentOrders: PurchaseRecord[] = [];
  ordersLoading = true;

  constructor(
    private auth: AuthService,
    private router: Router,
    private location: Location,
    private purchaseHistory: PurchaseHistoryService
  ) {}

  ngOnInit(): void {
    const token = this.auth.getToken();
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.sub || 'User';
        this.role = payload.role || 'Member';
        this.loading = false;
        this.profilePic = localStorage.getItem('profile_pic');
        this.loadRecentOrders();
      } catch (e) {
        this.onLogout();
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadRecentOrders(): void {
    this.recentOrders = this.purchaseHistory.getRecent(3);
    this.ordersLoading = false;
  }

  getOrderDate(o: PurchaseRecord): string {
    if (!o.soldDate) return '—';
    try { return new Date(o.soldDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
    catch { return '—'; }
  }

  getOrderTotal(o: PurchaseRecord): number {
    return o.total ?? 0;
  }

  getOrderStatus(o: PurchaseRecord): string {
    const s = (o.status || '').toLowerCase();
    if (s.includes('cancel')) return 'Cancelled';
    if (s.includes('deliver') || s.includes('complet') || s.includes('paid')) return 'Delivered';
    if (s.includes('process') || s.includes('progress')) return 'Processing';
    return 'Pending';
  }

  getStatusColor(o: PurchaseRecord): string {
    const label = this.getOrderStatus(o);
    const map: Record<string, string> = {
      Pending: '#ff9500', Processing: '#0a84ff', Delivered: '#34c759', Cancelled: '#ff3b30'
    };
    return map[label] || '#ff9500';
  }

  getItemCount(o: PurchaseRecord): number {
    return o.items?.length ?? 0;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;

    // Resize to max 200px to keep localStorage small
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 200;
        let w = img.width, h = img.height;
        if (w > max || h > max) {
          const ratio = Math.min(max / w, max / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        this.profilePic = dataUrl;
        localStorage.setItem('profile_pic', dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeProfilePic(): void {
    this.profilePic = null;
    localStorage.removeItem('profile_pic');
  }

  goBack(): void {
    this.location.back();
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}