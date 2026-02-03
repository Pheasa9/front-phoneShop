import { Injectable } from '@angular/core';
import { Product } from '../../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private CART_KEY = 'cart_items';
  private cart: CartItem[] = [];

  constructor() {
    this.loadCart();
  }

  // ---------- LOAD / SAVE ----------
  private saveCart() {
    localStorage.setItem(this.CART_KEY, JSON.stringify(this.cart));
  }

  private loadCart() {
    const data = localStorage.getItem(this.CART_KEY);
    this.cart = data ? JSON.parse(data) : [];
  }

  // ---------- CART ACTIONS ----------
  getCart(): CartItem[] {
    return this.cart;
  }

  addToCart(product: Product) {
    const item = this.cart.find(i => i.product.id === product.id);

    if (item) {
      item.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }

    this.saveCart();
  }

  removeFromCart(productId: number) {
    this.cart = this.cart.filter(i => i.product.id !== productId);
    this.saveCart();
  }

  increase(productId: number) {
    const item = this.cart.find(i => i.product.id === productId);
    if (item) item.quantity++;
    this.saveCart();
  }

  decrease(productId: number) {
    const item = this.cart.find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
    }
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    localStorage.removeItem(this.CART_KEY);
  }

  getTotalPrice(): number {
    return this.cart.reduce(
      (sum, item) => sum + item.product.salePrice * item.quantity,
      0
    );
  }

  getCartCount(): number {
    return this.cart.reduce((sum, i) => sum + i.quantity, 0);
  }

  // ---------- CHECKOUT ----------
  checkout() {
    console.log('Checkout payload:', this.cart);
    alert('Checkout successful ✅');
    this.clearCart();
  }
}
