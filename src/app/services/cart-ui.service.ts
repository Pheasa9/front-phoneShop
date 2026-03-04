import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartUiService {
  private openCart$ = new Subject<void>();
  onOpenCart = this.openCart$.asObservable();

  openCart(): void {
    this.openCart$.next();
  }
}
