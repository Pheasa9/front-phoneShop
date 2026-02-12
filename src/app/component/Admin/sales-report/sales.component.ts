import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductReportDto, ReportService } from '../../../core/services/admin/sale.service';

@Component({
  selector: 'app-admin-sale-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class AdminSalesComponent {

  startDate = '';
  endDate = '';

  isLoading = false;
  errorMsg = '';
  rows: ProductReportDto[] = [];

  // ✅ Cancel form
  showCancelForm = false;
  cancelSaleId: number | null = null;

  constructor(private api: ReportService) {}

  get totalUnits(): number {
    return (this.rows || []).reduce((s, x) => s + (Number(x.totalUnit) || 0), 0);
  }

  get totalAmount(): number {
    return (this.rows || []).reduce((s, x) => s + (Number(x.totalAmount) || 0), 0);
  }

  toggleCancelForm() {
    this.showCancelForm = !this.showCancelForm;
    this.errorMsg = '';
    if (!this.showCancelForm) this.cancelSaleId = null;
  }

  cancelById() {
    this.errorMsg = '';

    const id = Number(this.cancelSaleId);
    if (!id || id <= 0) {
      this.errorMsg = 'Please enter valid Sale ID';
      return;
    }

    if (!confirm(`Cancel sale #${id}?`)) return;

    this.isLoading = true;
    this.api.cancelSale(id).subscribe({
      next: () => {
        this.isLoading = false;
        this.cancelSaleId = null;
        this.showCancelForm = false;

        // reload report (optional)
        if (this.startDate && this.endDate) this.load();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'Cancel sale failed';
      }
    });
  }

  reset() {
    this.startDate = '';
    this.endDate = '';
    this.rows = [];
    this.errorMsg = '';
    this.showCancelForm = false;
    this.cancelSaleId = null;
  }

  load() {
    this.errorMsg = '';
    this.rows = [];

    if (!this.startDate || !this.endDate) {
      this.errorMsg = 'Please choose start date and end date';
      return;
    }

    if (this.startDate > this.endDate) {
      this.errorMsg = 'Start date must be before (or same as) end date';
      return;
    }

    this.isLoading = true;

    this.api.getSaleReport(this.startDate, this.endDate).subscribe({
      next: (res) => {
        this.rows = Array.isArray(res) ? res : [];
        this.isLoading = false;
        console.log('✅ Sale report rows:', this.rows);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'Load report failed';
      }
    });
  }
}
