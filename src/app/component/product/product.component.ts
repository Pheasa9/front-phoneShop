import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from './product.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    // 1. Load brands for the dropdown menu
    this.productService.getBrands().subscribe({
      next: (res: any) => {
        this.brands = Array.isArray(res) ? res : (res.list || res.content || []);

        // 2. Check for brandId in URL and convert it to a Name immediately
        this.route.queryParams.subscribe(params => {
          const brandIdFromUrl = params['brandId'];
          
          if (brandIdFromUrl && this.brands.length > 0) {
            const found = this.brands.find(b => b.id == brandIdFromUrl);
            if (found) {
              this.selectedBrandName = found.name; // Use the name from the object
            }
          }
          // 3. Fetch products using the name (either 'all' or the specific name)
          this.onBrandChange(); 
        });
      },
      error: (err) => {
        console.error('Error loading brands', err);
        this.isLoading = false;
      }
    });
  }

  // Called when dropdown changes or after initialization
  onBrandChange() {
    this.isLoading = true;
    
    // If 'all', we send an empty string or 'all' depending on your backend logic
    const nameToFilter = (this.selectedBrandName === 'all') ? '' : this.selectedBrandName;

    this.productService.getProductsFiltered(nameToFilter).subscribe({
      next: (res: any) => {
        // Backend returns List<ProductByNameDto>
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

  // Fix in product.component.ts
confirmCheckout() {
  // Check if cart is empty first
  if (this.cart.length === 0) return;

  // Build the list explicitly
  const productsList = this.cart.map(item => {
    return {
      productId: item.id || item.idProduct, // Ensure this isn't null
      unit: item.quantity || 1              // Ensure this isn't null
    };
  });

  const saleDto = {
    products: productsList, // This is now a clean array of objects
    soldDate: new Date().toISOString()
  };

  // VERIFY BEFORE SENDING
  console.log("Check this list carefully:", saleDto.products);

  this.productService.checkout(saleDto).subscribe({
    next: (res) => {
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