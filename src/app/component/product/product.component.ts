import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from './product.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ✅ add RouterModule
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  products: any[] = [];
  brands: any[] = [];
  cart: any[] = [];

  selectedBrandName: string = 'all';
  searchQuery: string = '';
  isLoading: boolean = false;
  isCheckoutMode: boolean = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router // ✅ inject Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    this.productService.getBrands().subscribe({
      next: (res: any) => {
        this.brands = Array.isArray(res) ? res : (res.list || res.content || []);

        this.route.queryParams.subscribe(params => {
          const brandIdFromUrl = params['brandId'];

          if (brandIdFromUrl && this.brands.length > 0) {
            const found = this.brands.find(b => b.id == brandIdFromUrl);
            if (found) {
              this.selectedBrandName = found.name;
            }
          }

          this.onBrandChange();
        });
      },
      error: (err) => {
        console.error('Error loading brands', err);
        this.isLoading = false;
      }
    });
  }

  onBrandChange() {
    this.isLoading = true;

    const nameToFilter = (this.selectedBrandName === 'all') ? '' : this.selectedBrandName;

    this.productService.getProductsFiltered(nameToFilter).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Filter Error:', err);
        this.products = [];
        this.isLoading = false;
      }
    });
  }

  get filteredProducts(): any[] {
    const list = Array.isArray(this.products) ? this.products : [];
    if (!this.searchQuery) return list;

    const query = this.searchQuery.toLowerCase();
    return list.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.model?.brand?.name && p.model.brand.name.toLowerCase().includes(query))
    );
  }

  addToCart(p: any) {
    if (p.availableUnit > 0) {
      p.availableUnit--;
      this.cart.push({ ...p });
    }
  }

  removeFromCart(item: any, index: number) {
    const original = this.products.find(p => p.id === item.id);
    if (original) original.availableUnit++;
    this.cart.splice(index, 1);
  }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.salePrice || 0), 0);
  }

  // ✅ MOVE OUTSIDE confirmCheckout
  goToDetails(productId: number) {
    this.router.navigate(['/product-details', productId]);
  }

  confirmCheckout() {
    if (this.cart.length === 0) return;

    const productsList = this.cart.map(item => ({
      productId: item.id || item.idProduct,
      unit: item.quantity || 1
    }));

    const saleDto = {
      products: productsList,
      soldDate: new Date().toISOString()
    };

    console.log("Check this list carefully:", saleDto.products);

    this.productService.checkout(saleDto).subscribe({
      next: () => {
        this.cart = [];
        localStorage.removeItem('cart');
        alert('Checkout Successful!');
        window.location.reload();
      },
      error: (err) => {
        console.error("The list format was rejected:", err);
      }
    });
  }
}
