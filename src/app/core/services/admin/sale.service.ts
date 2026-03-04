import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductReportDto {
  productId: number;
  productName: string;
  totalUnit: number;
  totalAmount: number; // BigDecimal -> number


}

// We use any for saleRows because backend field name for id may vary
export type SaleRowAny = any;

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly baseUrl = 'https://carproject-t9tv.onrender.com/reports';
  private readonly baseUrl2 = 'https://carproject-t9tv.onrender.com/sales';

  constructor(private http: HttpClient) {}

  // ✅ Product summary
  getSaleReport(startDate: string, endDate: string): Observable<ProductReportDto[]> {
    return this.http.get<ProductReportDto[]>(`${this.baseUrl}/${startDate}/${endDate}`);
  }

  // ✅ Sale rows for selecting + cancel (adjust URL if your backend path differs)
  getSaleRows(startDate: string, endDate: string): Observable<SaleRowAny[]> {
    return this.http.get<SaleRowAny[]>(`${this.baseUrl}/${startDate}/${endDate}`);
  }

  // ✅ Cancel sale
  cancelSale(saleId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl2}/${saleId}/cancel`, {});
  }
}
