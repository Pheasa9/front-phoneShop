import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

type RobotCommand = 'GO_CART';

@Injectable({ providedIn: 'root' })
export class RobotService {
  private commandSubject = new Subject<RobotCommand>();
  command$ = this.commandSubject.asObservable();

  goToCart() {
    this.commandSubject.next('GO_CART');
  }
}