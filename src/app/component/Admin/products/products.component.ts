import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { BrandAdminService } from '../../../core/services/admin/brand.service';
import { ProductAdminService } from '../../../core/services/admin/product.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class AdminProductsComponent implements OnInit {

  products: any[] = [];
  brands: any[] = [];
  models: any[] = [];

  selectedBrandId: any = '';
  searchName = '';
  private t: any = null;

  isLoading = false;
  msg = '';
  errorMsg = '';

  showCreate = false;
  showImport = false;
  showPrice = false;
  showUpload = false;

  createBrandId = 0;

  createForm = {
    modelId: 0,
    colorId: 0
  };

  importForm = {
    productId: 0,
    importUnit: 1,
    pricePerUnit: null as any
  };

  priceForm = {
    productId: 0,
    price: null as any
  };

  selectedFile: File | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private api: ProductAdminService,
    private brandApi: BrandAdminService
  ) {}

  ngOnInit(): void {
    if (!this.auth.getToken() || !this.auth.isAdmin()) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }
    this.loadBrands();
    this.loadProducts();
  }

  // ---------- LOAD ----------
  loadBrands() {
    this.brandApi.getBrands(0, 300).subscribe({
      next: (res: any) => {
        const list = res?.list || res?.content || res?.data || [];
        this.brands = Array.isArray(list) ? list : [];
      },
      error: (e: any) => console.error(e)
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.errorMsg = '';
    this.msg = '';

    const params: any = {};
    const brandName = this.getBrandNameById(this.selectedBrandId);

    if (brandName) params.brandName = brandName;
    if (this.searchName.trim()) params.name = this.searchName.trim();

    this.api.filterProducts(params).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : [];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.products = [];
        this.isLoading = false;
      }
    });
  }

  getBrandNameById(id: any): string {
    if (!id) return '';
    const b = this.brands.find(x => String(x.id) === String(id));
    return b?.name || '';
  }

  // ---------- FILTER UX ----------
  onSearchChange(v: string) {
    this.searchName = v;
    if (this.t) clearTimeout(this.t);
    this.t = setTimeout(() => this.loadProducts(), 350);
  }

  onBrandChange() {
    this.loadProducts();
  }

  reset() {
    this.selectedBrandId = '';
    this.searchName = '';
    this.loadProducts();
  }

  // ---------- ROUTE ----------
  goManageDetails(productId: number) {
    this.router.navigate(['/admin/product-details', productId]);
  }

  // ---------- CREATE ----------
  openCreate() {
    this.showCreate = true;
    this.msg = '';
    this.errorMsg = '';

    this.models = [];
    this.createBrandId = 0;
    this.createForm = { modelId: 0, colorId: 0 };
  }

  closeCreate() {
    this.showCreate = false;
  }

  // ✅ called when brand changes (load models)
 onCreateBrandSelect(brandId: any) {
  console.log('🔵 Brand selected raw value:', brandId);

  const id = Number(brandId);
  this.createBrandId = id;

  this.models = [];
  this.createForm.modelId = 0;

  if (!id || id <= 0) return;

  // ✅ use /models?brandId=...
  this.brandApi.getModelsByBrand(id).subscribe({
    next: (res: any) => {
      this.models = Array.isArray(res?.list) ? res.list : [];
      console.log('✅ MODELS LOADED:', this.models);
      console.log('🧾 FIRST MODEL OBJECT:', this.models[0]);
    },
    error: (e: any) => console.error('❌ Load models error:', e)
  });
}


  // ✅ called when model changes (force number + log)
  onModelChange(v: any) {
    console.log('🟡 model raw value:', v);
    this.createForm.modelId = Number(v);
    console.log('🟢 modelId saved:', this.createForm.modelId);
  }

  saveCreate() {
    console.log('🔴 saveCreate modelId =', this.createForm.modelId);

    this.errorMsg = '';

    const modelId = Number(this.createForm.modelId);
    const colorId = Number(this.createForm.colorId);

    if (!modelId || modelId <= 0) {
      this.errorMsg = 'Please select a model';
      return;
    }
    if (!colorId || colorId <= 0) {
      this.errorMsg = 'Please input Color ID (example: 1)';
      return;
    }

    this.isLoading = true;
    const payload = { modelId, colorId };
    console.log('📦 payload:', payload);

    this.api.createProduct(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.showCreate = false;
        this.msg = '✅ Product created';
        this.loadProducts();
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'Create failed (maybe duplicate model+color)';
      }
    });
  }

  // ---------- IMPORT STOCK ----------
  openImport(p: any) {
    this.showImport = true;
    this.msg = '';
    this.errorMsg = '';
    this.importForm = {
      productId: p.idProduct,
      importUnit: 1,
      pricePerUnit: null
    };
  }

  closeImport() {
    this.showImport = false;
  }

  saveImport() {
    const unit = Number(this.importForm.importUnit);
    if (!unit || unit <= 0) {
      this.errorMsg = 'Import unit must be > 0';
      return;
    }

    this.isLoading = true;

    this.api.importStock({
      productId: this.importForm.productId,
      importUnit: unit,
      pricePerUnit: this.importForm.pricePerUnit
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showImport = false;
        this.msg = '✅ Stock imported';
        this.loadProducts();
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'Import failed';
      }
    });
  }

  // ---------- SET PRICE ----------
  openPrice(p: any) {
    this.showPrice = true;
    this.msg = '';
    this.errorMsg = '';
    this.priceForm = {
      productId: p.idProduct,
      price: p.salePrice || null
    };
  }

  closePrice() {
    this.showPrice = false;
  }

  savePrice() {
    if (this.priceForm.price === null || this.priceForm.price === undefined) {
      this.errorMsg = 'Price is required';
      return;
    }

    this.isLoading = true;

    this.api.setPrice(this.priceForm.productId, { price: this.priceForm.price }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showPrice = false;
        this.msg = '✅ Price updated';
        this.loadProducts();
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'Price update failed';
      }
    });
  }

  // ---------- DELETE ----------
  delete(p: any) {
    const id = p.idProduct;
    if (!confirm(`Delete product ID ${id}?`)) return;

    this.isLoading = true;
    this.api.deleteProduct(id).subscribe({
      next: () => {
        this.isLoading = false;
        this.msg = '✅ Deleted';
        this.loadProducts();
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'Delete failed (maybe FK with ProductDetails)';
      }
    });
  }

  // ---------- UPLOAD EXCEL ----------
  openUpload() {
    this.showUpload = true;
    this.msg = '';
    this.errorMsg = '';
    this.selectedFile = null;
  }

  closeUpload() {
    this.showUpload = false;
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0];
    if (file) this.selectedFile = file;
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.errorMsg = 'Please choose an Excel file (.xlsx)';
      return;
    }

    this.isLoading = true;
    this.api.uploadExcel(this.selectedFile).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showUpload = false;

        const hasErrors = res && Object.keys(res).length > 0;
        this.msg = hasErrors ? '✅ Uploaded with some row errors (check console)' : '✅ Uploaded successfully';
        if (hasErrors) console.log('Upload row errors:', res);

        this.loadProducts();
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'Upload failed';
      }
    });
  }
}
