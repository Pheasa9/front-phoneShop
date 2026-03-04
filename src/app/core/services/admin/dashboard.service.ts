import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TopProductVm {
  name: string;
  popularity: number;
  sales: number;
}

export interface TodayDashboardVm {
  totalSales: number;
  totalUnits: number;
  ordersToday: number;
  avgServiceMinutes: number;
  onTimeRate: number;
  topProducts: TopProductVm[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  // ✅ point to Spring Boot
  private baseUrl = 'http://carproject-t9tv.onrender.com/api/admin/dashboard';

  constructor(private http: HttpClient) {}

  getTodayDashboard(date: string): Observable<TodayDashboardVm> {
    return this.http.get<TodayDashboardVm>(`${this.baseUrl}/today/${date}`);
  }

  // ✅ new: fetch latest day with sales
  getLatestDay(): Observable<string> {
    return this.http.get(`${this.baseUrl}/latest-day`, { responseType: 'text' });
  }
}
