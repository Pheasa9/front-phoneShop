import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { BrandAdminService } from '../../../core/services/admin/brand.service';
import { ModelDto, ModelAdminService } from '../../../core/services/admin/model.service';

@Component({
  selector: 'app-admin-models',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './models.component.html',
  styleUrl: './models.component.css'
})
export class AdminModelsComponent implements OnInit {

  brands: any[] = [];
  models: any[] = [];

  // filters
  selectedBrandId: any = ''; // '' = all
  searchName = '';
  private t: any = null;

  // paging
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  // state
  isLoading = false;
  errorMsg = '';
  msg = '';

  // modal
  showModal = false;
  isEdit = false;
  editId: number | null = null;
  form: ModelDto = { name: '', brandId: 0 };

  constructor(
    private auth: AuthService,
    private router: Router,
    private brandApi: BrandAdminService,
    private modelApi: ModelAdminService
  ) {}

  ngOnInit(): void {
    if (!this.auth.getToken() || !this.auth.isAdmin()) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }
    this.loadBrands();
    this.loadModels();
  }

  loadBrands() {
    this.brandApi.getBrands(0, 300).subscribe({
      next: (res) => {
        const list = res?.list || res?.content || res?.data || [];
        this.brands = Array.isArray(list) ? list : [];
      },
      error: (err) => console.error(err)
    });
  }

  loadModels() {
    this.isLoading = true;
    this.errorMsg = '';
    this.msg = '';

    const params: any = {
      page: this.page,
      size: this.size
    };

    // ✅ your backend supports brandId and name
    if (this.selectedBrandId !== '' && this.selectedBrandId !== null) {
      params.brandId = this.selectedBrandId;
    }
    if (this.searchName.trim()) {
      params.name = this.searchName.trim();
    }

    this.modelApi.getModels(params).subscribe({
      next: (res) => {
        this.models = Array.isArray(res?.list) ? res.list : [];

        const p = res?.pagination || {};
        // your pagination object is weird: pageNumber starts at 1 in your response
        // We'll treat backend as 1-based in display, but keep frontend page 0-based.
        this.totalPages = p.totalPages ?? 0;
        this.totalElements = p.totalElements ?? this.models.length;

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Cannot load models';
        this.isLoading = false;
      }
    });
  }

  // dynamic typing search
  onSearchChange(v: string) {
    this.searchName = v;
    if (this.t) clearTimeout(this.t);

    this.t = setTimeout(() => {
      this.page = 0;
      this.loadModels();
    }, 350);
  }

  onBrandChange() {
    this.page = 0;
    this.loadModels();
  }

  reset() {
    this.searchName = '';
    this.selectedBrandId = '';
    this.page = 0;
    this.loadModels();
  }

  prev() {
    if (this.page > 0) {
      this.page--;
      this.loadModels();
    }
  }

  next() {
    // If backend totalPages is 0 sometimes, we fallback by checking list size
    if (this.totalPages > 0) {
      if (this.page < this.totalPages - 1) {
        this.page++;
        this.loadModels();
      }
      return;
    }
    // fallback: allow next if current page has full size
    if (this.models.length === this.size) {
      this.page++;
      this.loadModels();
    }
  }

  openCreate() {
    this.showModal = true;
    this.isEdit = false;
    this.editId = null;
    this.form = { name: '', brandId: 0 };
    this.msg = '';
    this.errorMsg = '';
  }

  openEdit(m: any) {
    this.showModal = true;
    this.isEdit = true;
    this.editId = m?.id ?? null;
    this.form = {
      name: m?.name || '',
      brandId: m?.brand?.id || 0
    };
    this.msg = '';
    this.errorMsg = '';
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    const name = this.form.name.trim();
    const brandId = Number(this.form.brandId);

    if (!brandId || brandId <= 0) {
      this.errorMsg = 'Please select a brand';
      return;
    }
    if (!name) {
      this.errorMsg = 'Model name is required';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    if (this.isEdit && this.editId != null) {
      this.modelApi.update(this.editId, { name, brandId }).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.loadModels();
          this.msg = '✅ Updated successfully';
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.errorMsg = 'Update failed';
        }
      });
      return;
    }

    this.modelApi.create({ name, brandId }).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.loadModels();
        this.msg = '✅ Created successfully';
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'Create failed';
      }
    });
  }
}
