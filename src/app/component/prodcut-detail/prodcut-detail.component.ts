import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../models/product.model';
import { CartService } from '../../services/cart.service';

    // <-- adjust path

interface ProductDetailsDto {
  productId: number;
  productName: string;
  model: string;
  color: string;
  brand: string;
  salePrice: number;
  availableUnit: number;
  discountPrice?: number;
  description?: string;
  storage?: string;
  ram?: string;
  processor?: string;
  imagePath?: string;
}

@Component({
  selector: 'app-prodcut-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prodcut-detail.component.html',
  styleUrls: ['./prodcut-detail.component.css']
})
export class ProdcutDetailComponent implements OnInit {
  isLoading = true;
  errorMsg = '';
  details?: ProductDetailsDto;

  private baseUrl = 'http://localhost:8080';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cartService: CartService // ✅ inject
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMsg = 'Invalid product id';
      this.isLoading = false;
      return;
    }

    this.http.get<ProductDetailsDto>(`${this.baseUrl}/productDetails/product/${id}`)
      .subscribe({
        next: (res) => { this.details = res; this.isLoading = false; },
        error: () => { this.errorMsg = 'Cannot load product details'; this.isLoading = false; }
      });
  }

  addedToCart = false;

  back() {
    this.router.navigate(['/products']);
  }

  addToCart(): void {
    if (!this.details || this.details.availableUnit === 0) return;
    const product = {
      id: this.details.productId,
      name: this.details.productName,
      salePrice: this.details.salePrice,
      imagePath: this.details.imagePath || '',
      availableUnit: this.details.availableUnit
    };
    this.cartService.addToCart(product as any);
    this.addedToCart = true;
    setTimeout(() => this.addedToCart = false, 1800);
  }
}
