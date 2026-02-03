import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.css']
})
export class BrandsComponent implements OnInit {
handleImageError($event: ErrorEvent) {
throw new Error('Method not implemented.');
}
  brands: any[] = [];

  constructor(private brandService: BrandService, private router: Router) {}

  ngOnInit(): void {
    this.brandService.getBrands().subscribe({
      next: (res: any) => {
        // Assuming the backend returns brands in res.list
        if (res && res.list && Array.isArray(res.list)) {
          this.brands = res.list;
          console.log('Brands loaded:', this.brands);
        } else if (Array.isArray(res)) {
          this.brands = res;
        } else {
          console.error('Unexpected format from brand service:', res);
        }
      },
      error: (err) => console.error('HTTP Error:', err)
    });
  }

  viewProducts(brandId: number) {
  // Use 'products' to match your routes file
  this.router.navigate(['/products'], { queryParams: { brandId: brandId } });
}
}
