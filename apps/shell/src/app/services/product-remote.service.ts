import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {
  PRODUCT_SHELL_CHANNEL,
  type ProductShellEvent,
  type ShellProductEvent,
} from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class ProductRemoteService {
  private readonly productChannel = inject(PRODUCT_SHELL_CHANNEL, {
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.productChannel?.events$
      .pipe(
        filter((event): event is ProductShellEvent => event.source === 'product'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.handleProductEvent(event));
  }

  // ─── Receive events from product remote ─────────────────────────────────────

  private handleProductEvent(event: ProductShellEvent): void {
    switch (event.type) {
      case 'remote-ready':
        console.log('[Shell ← Product] Remote is ready');
        break;

      case 'product-selected':
        console.log('[Shell ← Product] Product selected', event.payload);
        break;

      case 'product-viewed':
        console.log('[Shell ← Product] Product viewed', event.payload);
        break;

      case 'add-to-cart-requested':
        console.log('[Shell ← Product] Add to cart requested', event.payload);
        break;

      default:
        console.log('[Shell ← Product] Unknown event type:', event.type, event.payload);
    }
  }

  // ─── Send events to product remote ──────────────────────────────────────────

  private publishToProduct(
    event: Omit<ShellProductEvent, 'source' | 'timestamp'>,
  ): void {
    this.productChannel?.publish({
      ...event,
      source: 'shell',
      timestamp: Date.now(),
    });
  }

  sendLoadProduct(productId: string): void {
    this.publishToProduct({
      type: 'load-product',
      payload: { message: 'Load product details', productId },
    });
  }

  sendClearSelection(): void {
    this.publishToProduct({
      type: 'clear-selection',
      payload: { message: 'Clear current product selection' },
    });
  }

  sendFilterByCategory(category: string, query?: string): void {
    this.publishToProduct({
      type: 'filter-by-category',
      payload: { message: 'Apply product filter', category, query },
    });
  }
}
