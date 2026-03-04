import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { DashboardService, TodayDashboardVm } from '../../../core/services/admin/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private router: Router,
    private dashApi: DashboardService
  ) {}

  isLoading = false;
  errorMsg = '';

  vm?: TodayDashboardVm;
  selectedDate = '';

  kpis: Array<{ title: string; value: string; note: string; icon: string; tone: string }> = [];
  topProducts: Array<{ name: string; popularity: number; sales: number }> = [];

  ngOnInit(): void {
    if (!this.auth.getToken() || !this.auth.isAdmin()) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    // ✅ start from today, fallback automatically
    this.loadWithFallback(0);
  }

  private isoDay(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private applyVm(vm: TodayDashboardVm, day: string) {
    this.vm = vm;
    this.selectedDate = day;

    const totalSales = Number(vm.totalSales ?? 0);
    const totalUnits = Number(vm.totalUnits ?? 0);
    const ordersToday = Number(vm.ordersToday ?? 0);

    this.kpis = [
      {
        title: 'Total Sales',
        value: `$${totalSales.toLocaleString()}`,
        note: `Date (${day})`,
        icon: '💳',
        tone: 'purple'
      },
      {
        title: 'Total Unit',
        value: `${totalUnits.toLocaleString()}`,
        note: `Date (${day})`,
        icon: '🛒',
        tone: 'orange'
      },
      {
        title: 'Orders',
        value: `${ordersToday.toLocaleString()}`,
        note: `Volume`,
        icon: '📦',
        tone: 'green'
      }
    ];

    this.topProducts = (vm.topProducts ?? []).map((p: any) => ({
      name: p.name,
      popularity: Number(p.popularity ?? 0),
      sales: Number(p.sales ?? 0)
    }));
  }

onBtnMove(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}





  // 🔥 CORE LOGIC: try today, then yesterday, etc (max 10 days back)
  loadWithFallback(backDays: number) {
    if (backDays > 10) {
      this.errorMsg = 'No sales data in last 10 days';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    const d = new Date();
    d.setDate(d.getDate() - backDays);
    const day = this.isoDay(d);

    this.dashApi.getTodayDashboard(day).subscribe({
      next: (vm) => {
        if ((vm.ordersToday ?? 0) > 0 || (vm.totalSales ?? 0) > 0) {
          // ✅ found data
          this.applyVm(vm, day);
          this.isLoading = false;
        } else {
          // ⏪ try previous day
          this.loadWithFallback(backDays + 1);
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Load dashboard failed';
        this.isLoading = false;
      }
    });
  }

  // optional date picker support
  onDateChange(ev: any) {
    const day = ev?.target?.value;
    if (!day) return;

    this.isLoading = true;
    this.errorMsg = '';

    this.dashApi.getTodayDashboard(day).subscribe({
      next: (vm) => {
        this.applyVm(vm, day);
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Load dashboard failed';
        this.isLoading = false;
      }
    });
  }

  exportCsv() {
    const day = this.selectedDate;

    const lines: string[] = [];
    lines.push(`KPI,Value,Note`);
    for (const k of this.kpis) lines.push(`"${k.title}","${k.value}","${k.note}"`);

    lines.push('');
    lines.push('Top Products,Popularity,Sales');
    for (const p of this.topProducts) lines.push(`"${p.name}","${p.popularity}%","${p.sales}"`);

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_${day}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
