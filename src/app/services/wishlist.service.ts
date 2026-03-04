import { Injectable } from '@angular/core';

export interface WishlistItem {
  id: number;
  name: string;
  brand: string;
  salePrice: number;
  imagePath: string;
  availableUnit: number;
  addedAt: string; // ISO date
}

@Injectable({ providedIn: 'root' })
export class WishlistService {

  private readonly KEY = 'wishlist_items';
  private items: WishlistItem[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    const raw = localStorage.getItem(this.KEY);
    this.items = raw ? JSON.parse(raw) : [];
  }

  private save(): void {
    localStorage.setItem(this.KEY, JSON.stringify(this.items));
  }

  getAll(): WishlistItem[] {
    return [...this.items];
  }

  count(): number {
    return this.items.length;
  }

  isWishlisted(productId: number): boolean {
    return this.items.some(i => i.id === productId);
  }

  toggle(product: any): boolean {
    const id = product.id ?? product.productId;
    const idx = this.items.findIndex(i => i.id === id);

    if (idx >= 0) {
      this.items.splice(idx, 1);
      this.save();
      return false; // removed
    }

    this.items.push({
      id,
      name: product.name || product.productName || '',
      brand: product.brand || product.brandName || product.model?.brand?.name || '',
      salePrice: product.salePrice || 0,
      imagePath: product.imagePath || '',
      availableUnit: product.availableUnit ?? 0,
      addedAt: new Date().toISOString()
    });
    this.save();
    return true; // added
  }

  remove(productId: number): void {
    this.items = this.items.filter(i => i.id !== productId);
    this.save();
  }

  clear(): void {
    this.items = [];
    this.save();
  }
}
