import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.css']
})
export class BrandsComponent implements OnInit {
  brands: any[] = [];
  loading = true;

  // Classification lists (lowercase)
  private readonly TOP_NAMES = ['apple', 'samsung', 'google', 'oneplus'];
  private readonly REC_NAMES = ['xiaomi', 'oppo', 'vivo', 'realme', 'nothing', 'huawei'];

  constructor(private brandService: BrandService, private router: Router) {}

  ngOnInit(): void {
    this.brandService.getBrands().subscribe({
      next: (res: any) => {
        if (res && res.list && Array.isArray(res.list)) {
          this.brands = res.list;
        } else if (Array.isArray(res)) {
          this.brands = res;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get topBrands(): any[] {
    return this.brands.filter(b => this.TOP_NAMES.includes(b.name.toLowerCase()));
  }

  get recommendedBrands(): any[] {
    return this.brands.filter(b => this.REC_NAMES.includes(b.name.toLowerCase()));
  }

  get regularBrands(): any[] {
    const special = [...this.TOP_NAMES, ...this.REC_NAMES];
    return this.brands.filter(b => !special.includes(b.name.toLowerCase()));
  }

  brandImg(name: string): string {
    return 'assets/img/brands/' + name.toLowerCase() + '.png';
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = 'grid';
  }

  viewProducts(brandId: number): void {
    this.router.navigate(['/products'], { queryParams: { brandId } });
  }
}
