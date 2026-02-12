import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BrandDto, BrandAdminService } from '../../../core/services/admin/brand.service';

@Component({
  selector: 'app-admin-brands',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css'
})
export class AdminBrandsComponent implements OnInit {

  brands: any[] = [];

  // paging (used when no search)
  page = 0;
  size = 10;
  totalPages = 0;

  // state
  isLoading = false;
  errorMsg = '';

  // search
  searchName = '';
  private searchTimer: any = null;

  // modal
  showModal = false;
  isEdit = false;
  editId: number | null = null;

  form: BrandDto = { name: '' };

  constructor(
    private brandApi: BrandAdminService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.getToken() || !this.auth.isAdmin()) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }
    this.loadPage();
  }

  // ---------- LOAD PAGE ----------
  loadPage(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.brandApi.getBrands(this.page, this.size).subscribe({
      next: (res) => {
        const content = res?.content || res?.list || res?.data || [];
        this.brands = Array.isArray(content) ? content : [];

        this.totalPages =
          res?.totalPages ??
          res?.page?.totalPages ??
          0;

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Cannot load brands';
        this.isLoading = false;
      }
    });
  }

  // ---------- DYNAMIC SEARCH (STARTS WITH) ----------
  onSearchChange(value: string) {
    const v = (value || '').trim();

    // debounce
    if (this.searchTimer) clearTimeout(this.searchTimer);

    this.searchTimer = setTimeout(() => {
      if (!v) {
        this.page = 0;
        this.loadPage();
        return;
      }

      this.isLoading = true;
      this.errorMsg = '';

      this.brandApi.filterByName(v).subscribe({
        next: (res) => {
          const list = Array.isArray(res) ? res : (res?.content || res?.list || []);
          // enforce startsWith on frontend (case-insensitive)
          this.brands = (Array.isArray(list) ? list : []).filter((b: any) =>
            (b?.name || '').toLowerCase().startsWith(v.toLowerCase())
          );

          this.totalPages = 0; // search mode
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Cannot search brands';
          this.isLoading = false;
        }
      });

    }, 400);
  }

  clearSearch() {
    this.searchName = '';
    this.page = 0;
    this.loadPage();
  }

  // ---------- PAGING ----------
  prev(): void {
    if (this.page > 0) {
      this.page--;
      this.loadPage();
    }
  }

  next(): void {
    if (this.totalPages && this.page < this.totalPages - 1) {
      this.page++;
      this.loadPage();
    }
  }

  // ---------- MODAL ----------
  openCreate(): void {
    this.showModal = true;
    this.isEdit = false;
    this.editId = null;
    this.form = { name: '' };
    this.errorMsg = '';
  }

  openEdit(b: any): void {
    this.showModal = true;
    this.isEdit = true;
    this.editId = b?.id ?? null;
    this.form = { name: b?.name || '' };
    this.errorMsg = '';
  }

  closeModal(): void {
    this.showModal = false;
  }

  // ---------- SAVE ----------
  save(): void {
    const name = (this.form.name || '').trim();
    if (!name) {
      this.errorMsg = 'Brand name is required';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    if (this.isEdit && this.editId != null) {
      this.brandApi.update(this.editId, { name }).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.loadPage();
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Update failed';
          this.isLoading = false;
        }
      });
      return;
    }

    this.brandApi.create({ name }).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.loadPage();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Create failed (maybe name already exists)';
        this.isLoading = false;
      }
    });
  }
}
