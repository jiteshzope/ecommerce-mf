import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {
  PRODUCT_SHELL_CHANNEL,
  PRODUCT_EVENT_TYPES,
  REMOTE_SOURCES,
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
        filter((event): event is ProductShellEvent => event.source === REMOTE_SOURCES.PRODUCT),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.handleProductEvent(event));
  }

  // ─── Receive events from product remote ─────────────────────────────────────

  private handleProductEvent(event: ProductShellEvent): void {
    switch (event.type) {
      case PRODUCT_EVENT_TYPES.REMOTE_READY:
        console.log('[Shell ← Product] Remote is ready');
        break;

      case PRODUCT_EVENT_TYPES.PRODUCT_SELECTED:
        console.log('[Shell ← Product] Product selected', event.payload);
        break;

      case PRODUCT_EVENT_TYPES.PRODUCT_VIEWED:
        console.log('[Shell ← Product] Product viewed', event.payload);
        break;

      case PRODUCT_EVENT_TYPES.ADD_TO_CART_REQUESTED:
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
      source: REMOTE_SOURCES.SHELL,
      timestamp: Date.now(),
    });
  }

  sendLoadProduct(productId: string): void {
    this.publishToProduct({
      type: PRODUCT_EVENT_TYPES.LOAD_PRODUCT,
      payload: { message: 'Load product details', productId },
    });
  }

  sendClearSelection(): void {
    this.publishToProduct({
      type: PRODUCT_EVENT_TYPES.CLEAR_SELECTION,
      payload: { message: 'Clear current product selection' },
    });
  }

  sendFilterByCategory(category: string, query?: string): void {
    this.publishToProduct({
      type: PRODUCT_EVENT_TYPES.FILTER_BY_CATEGORY,
      payload: { message: 'Apply product filter', category, query },
    });
  }
}
