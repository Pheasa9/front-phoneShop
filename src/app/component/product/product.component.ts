import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from './product.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

type CartItem = {
  id: number;
  name: string;
  brand?: string;
  colorName?: string;   // ✅ store string
  colorHex?: string;    // ✅ store hex
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
export class ProductComponent implements OnInit, OnDestroy {

  readonly API_BASE = 'http://localhost:8080';

  products: any[] = [];
  brands: any[] = [];
  cart: CartItem[] = [];

  // ✅ IMPORTANT: you used this.colors but it was missing
  colors: any[] = [];

  // ✅ colors map: colorId -> {name, hex}
  colorMap = new Map<number, { name: string; hex: string }>();

  selectedBrandName: string = 'all';
  searchQuery: string = '';
  isLoading: boolean = false;
  isCheckoutMode: boolean = false;

  pauseAutoBrand: boolean = false;

  @ViewChild('brandRail', { static: false })
  brandRail!: ElementRef<HTMLDivElement>;

  // ================= BANNER AUTO SLIDE =================
  @ViewChild('slidesTrack', { static: false })
  slidesTrack!: ElementRef<HTMLDivElement>;

  private bannerTimer: any = null;
  bannerIndex = 0;
  bannerPaused = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadColors();   // ✅ build colors + colorMap
    this.loadData();     // ✅ load brands + products

    // ✅ start banner after view is ready
    setTimeout(() => this.startBannerAuto(), 0);
  }

  ngOnDestroy(): void {
    if (this.bannerTimer) clearInterval(this.bannerTimer);
  }

  // ================= BANNER CONTROL =================
  pauseBanner(v: boolean) {
    this.bannerPaused = v;
  }

  startBannerAuto() {
    if (this.bannerTimer) clearInterval(this.bannerTimer);

    this.bannerTimer = setInterval(() => {
      if (this.bannerPaused) return;

      const track = this.slidesTrack?.nativeElement;
      if (!track) return;

      const total = track.children.length || 0;
      if (total <= 1) return;

      this.bannerIndex = (this.bannerIndex + 1) % total;
      track.style.transform = `translateX(-${this.bannerIndex * 100}%)`;
    }, 3500); // ✅ speed here
  }

  // ================= IMAGE HELPER =================
  imgUrl(obj: any): string {
    const file = obj?.imagePath;
    if (!file) return 'assets/img/placeholder-phone.png';
    if (file.startsWith('http://') || file.startsWith('https://')) return file;
    return `${this.API_BASE}/uploads/products/${file}`;
  }

  onImgError(ev: any){
    ev.target.src = 'assets/img/placeholder-phone.png';
  }

  // ================= COLORS =================
  // ✅ Load colors from API and also fill colorMap
  loadColors() {
    this.productService.getColors().subscribe({
      next: (res: any[]) => {
        this.colors = Array.isArray(res) ? res : [];

        // ✅ build map so getColorName/getColorHex works
        this.colorMap.clear();
        for (const c of this.colors) {
          const id = Number(c.id ?? c.colorId ?? c.color_id ?? 0);
          const name = String(c.name ?? c.colorName ?? '').trim();
          if (!id || !name) continue;
          this.colorMap.set(id, { name, hex: this.nameToHex(name) });
        }
      },
      error: () => {
        this.colors = [];
        this.colorMap.clear();
      }
    });
  }

  // ✅ Support your many possible product color fields
  getColorId(p: any): number {
    return Number(
      p?.colorId ??
      p?.color_id ??
      p?.color?.id ??
      p?.color?.colorId ??
      p?.colorDto?.id ??
      p?.colorDTO?.id ??
      p?.colorDto?.colorId ??
      0
    );
  }

  // ✅ USED BY CARD
  getColorName(p: any): string {
    // if product already has colorName, use it
    const direct = p?.colorName ?? p?.color?.name ?? '';
    if (direct) return String(direct);

    // else map by id
    const id = this.getColorId(p);
    return this.colorMap.get(id)?.name || '';
  }

  // ✅ USED BY DOT STYLE
  getColorHex(p: any): string {
    const id = this.getColorId(p);
    const fromMap = this.colorMap.get(id)?.hex;
    if (fromMap) return fromMap;

    // ✅ fallback: use color name if map not ready or id mismatch
    const name = this.getColorName(p);
    return this.nameToHex(name);
  }

  private nameToHex(name: string): string {
    const raw = (name || '').toLowerCase().trim();
    if (raw.startsWith('#') && (raw.length === 4 || raw.length === 7)) return raw;

    const map: Record<string,string> = {
      red:'#ef4444', blue:'#3b82f6', green:'#22c55e',
      black:'#111827', white:'#e5e7eb', silver:'#cbd5e1',
      gray:'#94a3b8', grey:'#94a3b8', gold:'#f59e0b',
      yellow:'#fbbf24', purple:'#a855f7', violet:'#8b5cf6',
      pink:'#fb7185', orange:'#f97316', navy:'#1e3a8a',
      sky:'#38bdf8', teal:'#14b8a6', cyan:'#06b6d4', brown:'#92400e'
    };

    const key = Object.keys(map).find(k => raw.includes(k));
    return key ? map[key] : '#cbd5e1';
  }

  // ================= FAKE RATING =================
  getFakeRating(p: any) {
    const seed = (p.id ?? p.idProduct ?? 1) * 13;
    const value = (4 + (seed % 10) / 10).toFixed(1); // 4.0 – 4.9
    const count = 80 + (seed % 400); // 80 – 480 reviews
    return { value, count };
  }

  // ================= BRAND SCROLL =================
  scrollBrand(px: number) {
    const rail = this.brandRail?.nativeElement;
    if (!rail) return;
    rail.scrollBy({ left: px, behavior: 'smooth' });
  }

  selectBrand(name: string) {
    this.selectedBrandName = name;
    this.onBrandChange();

    this.pauseAutoBrand = true;
    setTimeout(() => this.centerSelectedBrand(), 0);
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

  // ================= LOAD DATA =================
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
      error: () => this.isLoading = false
    });
  }

  onBrandChange() {
    this.isLoading = true;

    const nameToFilter =
      this.selectedBrandName === 'all' ? '' : this.selectedBrandName;

    this.productService.getProductsFiltered(nameToFilter).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : [];
        this.isLoading = false;
      },
      error: () => {
        this.products = [];
        this.isLoading = false;
      }
    });
  }

  // ================= SEARCH =================
  get filteredProducts(): any[] {
    const list = Array.isArray(this.products) ? this.products : [];
    if (!this.searchQuery) return list;
    const query = this.searchQuery.toLowerCase();
    return list.filter(p => (p.name || '').toLowerCase().includes(query));
  }

  // ================= CART =================
  get cartCount(): number {
    return this.cart.reduce((sum, it) => sum + (it.qty || 0), 0);
  }

  addToCart(p: any) {
    if (!p || p.availableUnit <= 0) return;

    const pid = Number(p.id ?? p.idProduct);
    p.availableUnit--;

    const existing = this.cart.find(c => c.id === pid);
    if (existing) {
      existing.qty++;
      this.cart = [...this.cart];
      return;
    }

    const item: CartItem = {
      id: pid,
      name: p.name,

      // ✅ brand safe (your backend often nested)
      brand: p.brand || p.brandName || p.model?.brand?.name || '—',

      // ✅ store colorName + colorHex
      colorName: this.getColorName(p),
      colorHex: this.getColorHex(p),

      imagePath: p.imagePath,
      salePrice: Number(p.salePrice || 0),
      qty: 1
    };

    this.cart = [...this.cart, item];
  }

  increaseQty(item: CartItem) {
    const original = this.products.find(x => Number(x.id ?? x.idProduct) === item.id);
    if (!original || original.availableUnit <= 0) return;

    original.availableUnit--;
    item.qty++;
    this.cart = [...this.cart];
  }

  decreaseQty(item: CartItem) {
    if (item.qty <= 1) return;

    const original = this.products.find(x => Number(x.id ?? x.idProduct) === item.id);
    if (original) original.availableUnit++;

    item.qty--;
    this.cart = [...this.cart];
  }

  removeItem(item: CartItem) {
    const original = this.products.find(x => Number(x.id ?? x.idProduct) === item.id);
    if (original) original.availableUnit += item.qty;
    this.cart = this.cart.filter(c => c.id !== item.id);
  }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.salePrice * item.qty), 0);
  }

  pid(p: any): number {
    return Number(p?.id ?? p?.idProduct ?? 0);
  }

  getCartItemByProduct(p: any): CartItem | null {
    const id = this.pid(p);
    return this.cart.find(it => it.id === id) || null;
  }

  getAvailableForIncrease(item: CartItem): number {
    const original = this.products.find(p => this.pid(p) === item.id);
    return original ? Number(original.availableUnit || 0) : 0;
  }

  toggleWishlist(p: any){
    p.isWishlisted = !p.isWishlisted;
  }

  // ================= CHECKOUT =================
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

    this.isLoading = true;

    this.productService.checkout(saleDto).subscribe({
      next: () => {
        this.cart = [];
        alert('Checkout Successful!');
        window.location.reload();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}