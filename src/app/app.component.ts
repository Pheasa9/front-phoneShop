import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CartService } from './services/cart.service';
import { CartUiService } from './services/cart-ui.service';
import { RobotService } from './services/robot.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  /* =========================
     ROUTER + ADMIN MODE
  ========================= */

  isAdminRoute = false;
  showRobot = false;
  private routerSub?: Subscription;

  constructor(
    private cartService: CartService,
    private cartUi: CartUiService,
    private router: Router,
    private robotSvc: RobotService
  ) {}

  openCart(): void {
    // Navigate to products page first, then signal checkout open
    if (!this.router.url.startsWith('/products')) {
      this.router.navigate(['/products']).then(() => {
        setTimeout(() => this.cartUi.openCart(), 100);
      });
    } else {
      this.cartUi.openCart();
    }
  }

  ngOnInit() {

    /* ===== ROUTER LISTENER ===== */
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {

        const url = this.router.url;

        this.isAdminRoute = url.startsWith('/admin');

        // 🤖 Show robot ONLY on products page
        this.showRobot = url.includes('/products');
      });

    /* ===== ROBOT SERVICE LISTENER ===== */
    this.robotSub = this.robotSvc.command$.subscribe(cmd => {
      if (cmd === 'GO_CART') this.goToCartIcon();
    });

    /* ===== ROBOT MOVEMENT LOOP ===== */
    const step = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const size = 76;

      if (this.robot.mode === 'goto') {

        const dx = this.robot.targetX - this.robot.x;
        const dy = this.robot.targetY - this.robot.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const speed = 4.2;
        this.robot.vx = (dx / dist) * speed;
        this.robot.vy = (dy / dist) * speed;

        this.robot.x += this.robot.vx;
        this.robot.y += this.robot.vy;

        if (dist < 8) {
          this.robot.mode = 'wander';
          this.robotJump();
        }

      } else {

        this.robot.x += this.robot.vx;
        this.robot.y += this.robot.vy;

        if (this.robot.x <= 0) {
          this.robot.x = 0;
          this.robot.vx = Math.abs(this.robot.vx);
        }
        if (this.robot.x >= w - size) {
          this.robot.x = w - size;
          this.robot.vx = -Math.abs(this.robot.vx);
        }

        if (this.robot.y <= 90) {
          this.robot.y = 90;
          this.robot.vy = Math.abs(this.robot.vy);
        }
        if (this.robot.y >= h - size) {
          this.robot.y = h - size;
          this.robot.vy = -Math.abs(this.robot.vy);
        }

        if (Math.random() < 0.02) {
          this.robot.vx += (Math.random() - 0.5) * 0.5;
          this.robot.vy += (Math.random() - 0.5) * 0.35;

          this.robot.vx = Math.max(-2.3, Math.min(2.3, this.robot.vx));
          this.robot.vy = Math.max(-1.8, Math.min(1.8, this.robot.vy));
        }
      }

      this.robot.flip = this.robot.vx < 0;

      this.robot.x = Math.max(0, Math.min(this.robot.x, w - size));
      this.robot.y = Math.max(90, Math.min(this.robot.y, h - size));

      this.raf = requestAnimationFrame(step);
    };

    this.raf = requestAnimationFrame(step);
    window.addEventListener('resize', this.keepRobotInBounds);
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.robotSub?.unsubscribe();
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.keepRobotInBounds);
  }

  /* =========================
     STARS BACKGROUND
  ========================= */

  stars = Array.from({ length: 120 }, () => ({
    top: Math.random() * 100,
    left: -(Math.random() * 40 + 10),
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 10,
    size: 1 + Math.random() * 3
  }));

  /* =========================
     CART BADGE
  ========================= */

  get cartCount(): number {
    return this.cartService.getCartCount();
  }

  /* =========================
     🤖 ROBOT SYSTEM
  ========================= */

  robot = {
    x: 60,
    y: 220,
    vx: 1.6,
    vy: 1.0,
    flip: false,
    jump: false,
    message: '' as string | null,
    mode: 'wander' as 'wander' | 'goto',
    targetX: 60,
    targetY: 220
  };

  private raf = 0;
  private robotSub?: Subscription;

  robotClick() {

    this.robot.jump = true;
    setTimeout(() => this.robot.jump = false, 400);

    const messages = [
      "Welcome to SMOS 🤖✨",
      "Looking for a new phone? 📱",
      "Best price. Best quality.",
      "Check out our latest deals 🔥",
      "Need help? I'm here!"
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    this.robot.message = randomMessage;

    setTimeout(() => {
      this.robot.message = '';
    }, 3000);
  }

  keepRobotInBounds = () => {
    const size = 76;
    this.robot.x = Math.min(this.robot.x, window.innerWidth - size);
    this.robot.y = Math.min(this.robot.y, window.innerHeight - size);
  };

  robotJump() {
    this.robot.jump = true;
    setTimeout(() => (this.robot.jump = false), 520);
  }

  private goToCartIcon() {
    const cart = document.getElementById('cartIcon');
    if (!cart) return;

    const r = cart.getBoundingClientRect();

    this.robot.targetX = Math.max(8, r.left - 40);
    this.robot.targetY = Math.max(90, r.top + 40);

    this.robot.mode = 'goto';
  }
}