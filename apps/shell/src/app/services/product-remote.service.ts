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
import { ShellStore } from '../stores/shell.store';

@Injectable({ providedIn: 'root' })
export class ProductRemoteService {
  private readonly productChannel = inject(PRODUCT_SHELL_CHANNEL, {
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);
  private readonly shellStore = inject(ShellStore) as InstanceType<typeof ShellStore>;

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

      case PRODUCT_EVENT_TYPES.CART_UPDATED:
        if (this.shellStore.isAuthenticated()) {
          void this.shellStore.loadCartItemCount();
        }
        console.log('[Shell ← Product] Cart updated; refreshed item count', event.payload);
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
