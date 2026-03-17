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

@Injectable({ providedIn: 'root' })
export class CartShellBridgeService {
  private readonly cartChannel = inject(CART_SHELL_CHANNEL, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Subscribe to events arriving from the shell
    this.cartChannel?.events$
      .pipe(
        filter((event): event is ShellCartEvent => event.source === REMOTE_SOURCES.SHELL),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.handleShellEvent(event));
  }

  // ─── Receive events from shell ───────────────────────────────────────────────

  private handleShellEvent(event: ShellCartEvent): void {
    switch (event.type) {
      case CART_EVENT_TYPES.ADD_ITEM:
        console.log('[Cart ← Shell] Add item', event.payload);
        break;

      case CART_EVENT_TYPES.REMOVE_ITEM:
        console.log('[Cart ← Shell] Remove item', event.payload);
        break;

      case CART_EVENT_TYPES.CLEAR_CART:
        console.log('[Cart ← Shell] Clear cart');
        break;

      case CART_EVENT_TYPES.SYNC_CART:
        console.log('[Cart ← Shell] Sync cart with server');
        break;

      default:
        console.log('[Cart ← Shell] Unknown event type:', event.type, event.payload);
    }
  }

  // ─── Send events to shell ────────────────────────────────────────────────────

  private publish(event: Omit<CartShellEvent, 'source' | 'timestamp'>): void {
    this.cartChannel?.publish({
      ...event,
      source: REMOTE_SOURCES.CART,
      timestamp: Date.now(),
    });
  }

  publishRemoteReady(): void {
    this.publish({
      type: 'remote-ready',
      payload: { message: 'Cart remote is ready' },
    });
  }

  publishCartUpdated(itemCount: number): void {
    this.publish({
      type: 'cart-updated',
      payload: { message: 'Cart items updated', itemCount },
    });
  }

  publishCheckoutInitiated(itemCount: number): void {
    this.publish({
      type: 'checkout-initiated',
      payload: { message: 'User initiated checkout', itemCount },
    });
  }

  publishCartCleared(): void {
    this.publish({
      type: 'cart-cleared',
      payload: { message: 'Cart has been cleared' },
    });
  }
}
