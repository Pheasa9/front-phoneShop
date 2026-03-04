import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PurchaseHistoryService, PurchaseRecord } from '../../services/purchase-history.service';

type OrderStatus = 'all' | 'pending' | 'delivered' | 'processing' | 'cancelled';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  private readonly API = 'https://carproject-t9tv.onrender.com';

  orders: PurchaseRecord[] = [];
  isLoading = true;
  errorMsg = '';
  activeTab: OrderStatus = 'all';

  tabs: { label: string; value: OrderStatus; icon: string; color: string }[] = [
    { label: 'All',        value: 'all',        icon: 'bi-list-ul',                color: '#0a84ff' },
    { label: 'Pending',    value: 'pending',     icon: 'bi-credit-card-2-front',    color: '#ff9500' },
    { label: 'Processing', value: 'processing',  icon: 'bi-arrow-repeat',           color: '#0a84ff' },
    { label: 'Delivered',  value: 'delivered',    icon: 'bi-box-seam',               color: '#34c759' },
    { label: 'Cancelled',  value: 'cancelled',   icon: 'bi-x-circle',               color: '#ff3b30' },
  ];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private purchaseHistory: PurchaseHistoryService
  ) {}

  ngOnInit(): void {
    const status = this.route.snapshot.queryParamMap.get('status');
    if (status && ['pending', 'delivered', 'processing', 'cancelled'].includes(status)) {
      this.activeTab = status as OrderStatus;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.orders = this.purchaseHistory.getAll();
    this.isLoading = false;
  }

  get filteredOrders(): PurchaseRecord[] {
    if (this.activeTab === 'all') return this.orders;
    return this.orders.filter(o => this.getStatus(o) === this.activeTab);
  }

  getStatus(order: PurchaseRecord): OrderStatus {
    const s = (order.status || '').toLowerCase();
    if (s.includes('cancel')) return 'cancelled';
    if (s.includes('deliver') || s.includes('complet') || s.includes('paid')) return 'delivered';
    if (s.includes('process') || s.includes('progress')) return 'processing';
    return 'pending';
  }

  getStatusLabel(order: PurchaseRecord): string {
    const map: Record<OrderStatus, string> = {
      all: '', pending: 'Pending', processing: 'Processing', delivered: 'Delivered', cancelled: 'Cancelled'
    };
    return map[this.getStatus(order)] || 'Pending';
  }

  getStatusColor(order: PurchaseRecord): string {
    const map: Record<OrderStatus, string> = {
      all: '', pending: '#ff9500', processing: '#0a84ff', delivered: '#34c759', cancelled: '#ff3b30'
    };
    return map[this.getStatus(order)] || '#ff9500';
  }

  getTotal(order: PurchaseRecord): number {
    return order.total ?? 0;
  }

  getDate(order: PurchaseRecord): string {
    if (!order.soldDate) return '—';
    try { return new Date(order.soldDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '—'; }
  }

  getItemCount(order: PurchaseRecord): number {
    return order.items?.length ?? 0;
  }

  goBack(): void {
    this.location.back();
  }
}
