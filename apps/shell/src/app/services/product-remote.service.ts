import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  PRODUCT_SHELL_CHANNEL,
  SHELL_PRODUCT_CHANNEL,
  type ProductShellEvent,
} from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class ProductRemoteService {
  private readonly productChannel = inject(PRODUCT_SHELL_CHANNEL, {
    optional: true,
  });
  private readonly shellProductChannel = inject(SHELL_PRODUCT_CHANNEL, {
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.productChannel?.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  sendLoadProduct(productId: string): void {
    this.shellProductChannel?.publish({
      type: 'load-product',
      source: 'shell',
      timestamp: Date.now(),
      payload: { message: 'Load product details', productId },
    });
  }

  sendClearSelection(): void {
    this.shellProductChannel?.publish({
      type: 'clear-selection',
      source: 'shell',
      timestamp: Date.now(),
      payload: { message: 'Clear current product selection' },
    });
  }

  sendFilterByCategory(category: string, query?: string): void {
    this.shellProductChannel?.publish({
      type: 'filter-by-category',
      source: 'shell',
      timestamp: Date.now(),
      payload: { message: 'Apply product filter', category, query },
    });
  }
}
