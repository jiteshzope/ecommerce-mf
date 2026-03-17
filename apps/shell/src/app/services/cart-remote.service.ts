import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {
  CART_SHELL_CHANNEL,
  type CartShellEvent,
  type ShellCartEvent,
} from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class CartRemoteService {
  private readonly cartChannel = inject(CART_SHELL_CHANNEL, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.cartChannel?.events$
      .pipe(
        filter((event): event is CartShellEvent => event.source === 'cart'),
        takeUntilDestroyed(this.destroyRef),
      )
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

  private publishToCart(event: Omit<ShellCartEvent, 'source' | 'timestamp'>): void {
    this.cartChannel?.publish({
      ...event,
      source: 'shell',
      timestamp: Date.now(),
    });
  }

  sendAddItem(productId: string, quantity: number): void {
    this.publishToCart({
      type: 'add-item',
      payload: { message: 'Add item to cart', productId, quantity },
    });
  }

  sendRemoveItem(productId: string): void {
    this.publishToCart({
      type: 'remove-item',
      payload: { message: 'Remove item from cart', productId },
    });
  }

  sendClearCart(): void {
    this.publishToCart({
      type: 'clear-cart',
      payload: { message: 'Clear the entire cart' },
    });
  }

  sendSyncCart(): void {
    this.publishToCart({
      type: 'sync-cart',
      payload: { message: 'Sync cart state with server' },
    });
  }
}
