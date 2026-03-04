import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
toggleCheckout() {
throw new Error('Method not implemented.');
}

  isAdminRoute = false;
isCheckoutMode: any;

constructor(private cartService: CartService, private router: Router) {
  this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe(() => {
      this.isAdminRoute = this.router.url.startsWith('/admin');
    });
}

  // navbar badge
  get cartCount(): number {
    return this.cartService.getCartCount();
  }
}
