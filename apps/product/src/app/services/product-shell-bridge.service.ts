import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {
  PRODUCT_SHELL_CHANNEL,
  type ProductShellEvent,
  type ShellProductEvent,
} from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class ProductShellBridgeService {
  private readonly productChannel = inject(PRODUCT_SHELL_CHANNEL, {
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Subscribe to events arriving from the shell
    this.productChannel?.events$
      .pipe(
        filter((event): event is ShellProductEvent => event.source === 'shell'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.handleShellEvent(event));
  }

  // ─── Receive events from shell ───────────────────────────────────────────────

  private handleShellEvent(event: ShellProductEvent): void {
    switch (event.type) {
      case 'load-product':
        console.log('[Product ← Shell] Load product', event.payload);
        break;

      case 'clear-selection':
        console.log('[Product ← Shell] Clear selection');
        break;

      case 'filter-by-category':
        console.log('[Product ← Shell] Filter by category', event.payload);
        break;

      default:
        console.log('[Product ← Shell] Unknown event type:', event.type, event.payload);
    }
  }

  // ─── Send events to shell ────────────────────────────────────────────────────

  private publish(event: Omit<ProductShellEvent, 'source' | 'timestamp'>): void {
    this.productChannel?.publish({
      ...event,
      source: 'product',
      timestamp: Date.now(),
    });
  }

  publishRemoteReady(): void {
    this.publish({
      type: 'remote-ready',
      payload: { message: 'Product remote is ready' },
    });
  }

  publishProductSelected(productId: string): void {
    this.publish({
      type: 'product-selected',
      payload: { message: 'Product selected by user', productId },
    });
  }

  publishProductViewed(productId: string): void {
    this.publish({
      type: 'product-viewed',
      payload: { message: 'Product detail page viewed', productId },
    });
  }

  publishAddToCartRequested(productId: string): void {
    this.publish({
      type: 'add-to-cart-requested',
      payload: { message: 'User requested add to cart', productId },
    });
  }
}
