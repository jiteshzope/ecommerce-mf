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
export class ProductShellBridgeService {
  private readonly productChannel = inject(PRODUCT_SHELL_CHANNEL, {
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Subscribe to events arriving from the shell
    this.productChannel?.events$
      .pipe(
        filter((event): event is ShellProductEvent => event.source === REMOTE_SOURCES.SHELL),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.handleShellEvent(event));
  }

  // ─── Receive events from shell ───────────────────────────────────────────────

  private handleShellEvent(event: ShellProductEvent): void {
    switch (event.type) {
      case PRODUCT_EVENT_TYPES.LOAD_PRODUCT:
        console.log('[Product ← Shell] Load product', event.payload);
        break;

      case PRODUCT_EVENT_TYPES.CLEAR_SELECTION:
        console.log('[Product ← Shell] Clear selection');
        break;

      case PRODUCT_EVENT_TYPES.FILTER_BY_CATEGORY:
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
      source: REMOTE_SOURCES.PRODUCT,
      timestamp: Date.now(),
    });
  }

  publishRemoteReady(): void {
    this.publish({
      type: 'remote-ready',
      payload: { message: 'Product remote is ready' },
    });
  }

  publishCartUpdated(): void {
    this.publish({
      type: PRODUCT_EVENT_TYPES.CART_UPDATED,
      payload: {},
    });
  }
}
