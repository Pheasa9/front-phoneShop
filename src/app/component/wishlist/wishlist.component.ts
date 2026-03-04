import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService, WishlistItem } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {

  readonly API = 'https://carproject-t9tv.onrender.com';
  items: WishlistItem[] = [];
  addedId: number | null = null;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.items = this.wishlistService.getAll();
  }

  imgUrl(item: WishlistItem): string {
    return item.imagePath
      ? `${this.API}/images/${item.imagePath}`
      : 'assets/img/products/placeholder.png';
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/img/products/placeholder.png';
  }

  remove(id: number): void {
    this.wishlistService.remove(id);
    this.items = this.wishlistService.getAll();
  }

  addToCart(item: WishlistItem): void {
    if (item.availableUnit === 0) return;
    const product = {
      id: item.id,
      name: item.name,
      salePrice: item.salePrice,
      imagePath: item.imagePath,
      availableUnit: item.availableUnit
    };
    this.cartService.addToCart(product as any);
    this.addedId = item.id;
    setTimeout(() => this.addedId = null, 1600);
  }

  clearAll(): void {
    this.wishlistService.clear();
    this.items = [];
  }

  goBack(): void {
    this.location.back();
  }
}
