import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductDetailsService, ProductDetailsDto } from '../../../core/services/admin/product-details.service';

@Component({
  selector: 'app-admin-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class AdminProductDetailsComponent implements OnInit {

  productId = 0;

  details: ProductDetailsDto | null = null;
  isLoading = true;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ProductDetailsService
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.productId) {
      this.errorMsg = 'Invalid product id';
      this.isLoading = false;
      return;
    }
    this.loadDetails();
  }

  back() {
    this.router.navigate(['/admin/products']);
  }

loadDetails() {
  this.isLoading = true;
  this.errorMsg = '';
  this.details = null;

  this.api.getByProductId(this.productId).subscribe({
    next: (res) => {
      this.details = res;
      this.isLoading = false;
    },
    error: (err) => {
      this.isLoading = false;

      // ✅ If backend returns 404 = not created yet
      if (err?.status === 404) {
        this.errorMsg = 'This product has no details yet.';
        return;
      }

      this.errorMsg = 'Failed to load product details.';
      console.error(err);
    }
  });
}


  // optional: create empty detail (if you want to support create from UI later)
  createEmptyDetails() {
    this.isLoading = true;
    this.errorMsg = '';

    this.api.create({ productId: this.productId }).subscribe({
      next: (res) => {
        this.details = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'Create details failed';
      }
    });
  }
}
