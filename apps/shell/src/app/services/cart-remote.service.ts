import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {
  CART_SHELL_CHANNEL,
  CART_EVENT_TYPES,
  REMOTE_SOURCES,
  type CartShellEvent,
  type ShellCartEvent,
} from '@ecommerce-mf/session';
import { ShellStore } from '../stores/shell.store';

@Injectable({ providedIn: 'root' })
export class CartRemoteService {
  private readonly cartChannel = inject(CART_SHELL_CHANNEL, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly shellStore = inject(ShellStore) as InstanceType<typeof ShellStore>;

  constructor() {
    this.cartChannel?.events$
      .pipe(
        filter((event): event is CartShellEvent => event.source === REMOTE_SOURCES.CART),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.handleCartEvent(event));
  }

  // ─── Receive events from cart remote ────────────────────────────────────────

  private handleCartEvent(event: CartShellEvent): void {
    switch (event.type) {
      case CART_EVENT_TYPES.REMOTE_READY:
        console.log('[Shell ← Cart] Remote is ready');
        break;

      case CART_EVENT_TYPES.CART_UPDATED:
        this.shellStore.setCartItemCount(event.payload.itemCount ?? 0);
        console.log('[Shell ← Cart] Cart updated', event.payload);
        break;

      case CART_EVENT_TYPES.CHECKOUT_INITIATED:
        console.log('[Shell ← Cart] Checkout initiated', event.payload);
        break;

      case CART_EVENT_TYPES.CART_CLEARED:
        this.shellStore.setCartItemCount(0);
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
      source: REMOTE_SOURCES.SHELL,
      timestamp: Date.now(),
    });
  }

  sendAddItem(productId: string, quantity: number): void {
    this.publishToCart({
      type: CART_EVENT_TYPES.ADD_ITEM,
      payload: { message: 'Add item to cart', productId, quantity },
    });
  }

  sendRemoveItem(productId: string): void {
    this.publishToCart({
      type: CART_EVENT_TYPES.REMOVE_ITEM,
      payload: { message: 'Remove item from cart', productId },
    });
  }

  sendClearCart(): void {
    this.publishToCart({
      type: CART_EVENT_TYPES.CLEAR_CART,
      payload: { message: 'Clear the entire cart' },
    });
  }

  sendSyncCart(): void {
    this.publishToCart({
      type: CART_EVENT_TYPES.SYNC_CART,
      payload: { message: 'Sync cart state with server' },
    });
  }
}
