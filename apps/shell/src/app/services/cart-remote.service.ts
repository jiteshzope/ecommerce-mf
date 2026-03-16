import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CART_SHELL_CHANNEL,
  SHELL_CART_CHANNEL,
  type CartShellEvent,
} from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class CartRemoteService {
  private readonly cartChannel = inject(CART_SHELL_CHANNEL, { optional: true });
  private readonly shellCartChannel = inject(SHELL_CART_CHANNEL, {
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.cartChannel?.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.handleCartEvent(event));
  }

  // ─── Receive events from cart remote ────────────────────────────────────────

  private handleCartEvent(event: CartShellEvent): void {
    switch (event.type) {
      case 'remote-ready':
        console.log('[Shell ← Cart] Remote is ready');
        break;

      case 'cart-updated':
        console.log('[Shell ← Cart] Cart updated', event.payload);
        break;

      case 'checkout-initiated':
        console.log('[Shell ← Cart] Checkout initiated', event.payload);
        break;

      case 'cart-cleared':
        console.log('[Shell ← Cart] Cart cleared');
        break;

      default:
        console.log('[Shell ← Cart] Unknown event type:', event.type, event.payload);
    }
  }

  // ─── Send events to cart remote ─────────────────────────────────────────────

  sendAddItem(productId: string, quantity: number): void {
    this.shellCartChannel?.publish({
      type: 'add-item',
      source: 'shell',
      timestamp: Date.now(),
      payload: { message: 'Add item to cart', productId, quantity },
    });
  }

  sendRemoveItem(productId: string): void {
    this.shellCartChannel?.publish({
      type: 'remove-item',
      source: 'shell',
      timestamp: Date.now(),
      payload: { message: 'Remove item from cart', productId },
    });
  }

  sendClearCart(): void {
    this.shellCartChannel?.publish({
      type: 'clear-cart',
      source: 'shell',
      timestamp: Date.now(),
      payload: { message: 'Clear the entire cart' },
    });
  }

  sendSyncCart(): void {
    this.shellCartChannel?.publish({
      type: 'sync-cart',
      source: 'shell',
      timestamp: Date.now(),
      payload: { message: 'Sync cart state with server' },
    });
  }
}
