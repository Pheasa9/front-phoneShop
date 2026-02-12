// product.component.ts
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from './product.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

type CartItem = {
  id: number;
  name: string;
  brand?: string;
  color?: string;
  imagePath?: string;
  salePrice: number;
  qty: number;
};

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  products: any[] = [];
  brands: any[] = [];

  // ✅ cart is now aggregated by product (with qty)
  cart: CartItem[] = [];

  selectedBrandName: string = 'all';
  searchQuery: string = '';
  isLoading: boolean = false;
  isCheckoutMode: boolean = false;

  // Brand rail features
  pauseAutoBrand: boolean = false;

  @ViewChild('brandRail', { static: false })
  brandRail!: ElementRef<HTMLDivElement>;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // ========= UI actions =========
  toggleCheckout() {
    this.isCheckoutMode = !this.isCheckoutMode;
  }

  scrollBrand(px: number) {
    const rail = this.brandRail?.nativeElement;
    if (!rail) return;
    rail.scrollBy({ left: px, behavior: 'smooth' });
  }

  // =========================
  // Brand: select + center
  // =========================
  selectBrand(name: string) {
    this.selectedBrandName = name;
    this.onBrandChange();

    // pause auto while user interacts
    this.pauseAutoBrand = true;

    setTimeout(() => this.centerSelectedBrand(), 0);

    // resume later (keep long)
    setTimeout(() => (this.pauseAutoBrand = false), 1200);
  }

  private centerSelectedBrand() {
    const rail = this.brandRail?.nativeElement;
    if (!rail) return;

    const active = rail.querySelector('.brand-pill.active') as HTMLElement | null;
    if (!active) return;

    const railRect = rail.getBoundingClientRect();
    const elRect = active.getBoundingClientRect();

    const currentScroll = rail.scrollLeft;
    const target =
      currentScroll +
      (elRect.left - railRect.left) -
      (railRect.width / 2 - elRect.width / 2);

    rail.scrollTo({ left: target, behavior: 'smooth' });
  }

  // =========================
  // Load brands + apply brandId from URL
  // =========================
  loadData() {
    this.isLoading = true;

    this.productService.getBrands().subscribe({
      next: (res: any) => {
        this.brands = Array.isArray(res) ? res : (res.list || res.content || []);

        this.route.queryParams.subscribe(params => {
          const brandIdFromUrl = params['brandId'];

          if (brandIdFromUrl && this.brands.length > 0) {
            const found = this.brands.find(b => b.id == brandIdFromUrl);
            if (found) this.selectedBrandName = found.name;
          }

          this.onBrandChange();
          setTimeout(() => this.centerSelectedBrand(), 0);
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
        setTimeout(() => this.centerSelectedBrand(), 0);
      },
      error: (err) => {
        console.error('Filter Error:', err);
        this.products = [];
        this.isLoading = false;
      }
    });
  }

  // =========================
  // Search filter
  // =========================
  get filteredProducts(): any[] {
    const list = Array.isArray(this.products) ? this.products : [];
    if (!this.searchQuery) return list;

    const query = this.searchQuery.toLowerCase();
    return list.filter(p =>
      (p.name || '').toLowerCase().includes(query) ||
      (p.model?.brand?.name && p.model.brand.name.toLowerCase().includes(query))
    );
  }

  // =========================
  // Cart helpers
  // =========================
  get cartCount(): number {
    return this.cart.reduce((sum, it) => sum + (it.qty || 0), 0);
  }

  getCartQty(productId: number): number {
    const found = this.cart.find(c => c.id === productId);
    return found ? found.qty : 0;
  }

  // How many units still available to increase from cart (based on current products stock)
  getAvailableForIncrease(item: CartItem): number {
    const original = this.products.find(p => p.id === item.id);
    // original.availableUnit already reduced when adding items
    return original ? (original.availableUnit || 0) : 0;
  }

  // =========================
  // Cart actions (with qty)
  // =========================
  addToCart(p: any) {
    if (!p || p.availableUnit <= 0) return;

    // reduce stock in product list
    p.availableUnit--;

    const existing = this.cart.find(c => c.id === p.id);
    if (existing) {
      existing.qty++;
      this.cart = [...this.cart]; // refresh UI
      return;
    }

    const item: CartItem = {
      id: p.id,
      name: p.name,
      brand: p.brand,
      color: p.color,
      imagePath: p.imagePath,
      salePrice: Number(p.salePrice || 0),
      qty: 1
    };

    this.cart = [...this.cart, item];
  }

  increaseQty(item: CartItem) {
    const original = this.products.find(p => p.id === item.id);
    if (!original || original.availableUnit <= 0) return;

    // consume stock + increase qty
    original.availableUnit--;
    item.qty++;
    this.cart = [...this.cart];
  }

  decreaseQty(item: CartItem) {
    if (item.qty <= 1) return;

    const original = this.products.find(p => p.id === item.id);
    if (original) original.availableUnit++;

    item.qty--;
    this.cart = [...this.cart];
  }

  removeItem(item: CartItem) {
    // restore all qty back to stock
    const original = this.products.find(p => p.id === item.id);
    if (original) original.availableUnit += item.qty;

    this.cart = this.cart.filter(c => c.id !== item.id);
  }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + (Number(item.salePrice || 0) * (item.qty || 0)), 0);
  }

  // =========================
  // Checkout (send qty correctly)
  // =========================
  confirmCheckout() {
    if (this.cart.length === 0) return;

    const productsList = this.cart.map(item => ({
      productId: item.id,
      unit: item.qty
    }));

    const saleDto = {
      products: productsList,
      soldDate: new Date().toISOString()
    };

    console.log("Check this list carefully:", saleDto.products);

    this.isLoading = true;

    this.productService.checkout(saleDto).subscribe({
      next: () => {
        this.cart = [];
        localStorage.removeItem('cart');
        alert('Checkout Successful!');
        window.location.reload();
      },
      error: (err) => {
        console.error("The list format was rejected:", err);
        this.isLoading = false;
      }
    });
  }
}
