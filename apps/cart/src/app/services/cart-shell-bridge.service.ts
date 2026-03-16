import { Injectable, inject } from '@angular/core';
import { CART_SHELL_CHANNEL, type CartShellEvent } from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class CartShellBridgeService {
  private readonly cartChannel = inject(CART_SHELL_CHANNEL, { optional: true });

  publish(event: Omit<CartShellEvent, 'source' | 'timestamp'>): void {
    this.cartChannel?.publish({
      ...event,
      source: 'cart',
      timestamp: Date.now(),
    });
  }

  publishRemoteReady(): void {
    this.publish({
      type: 'remote-ready',
      payload: { message: 'Cart remote is ready' },
    });
  }
}
