import { Injectable, inject } from '@angular/core';
import {
  PRODUCT_SHELL_CHANNEL,
  type ProductShellEvent,
} from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class ProductShellBridgeService {
  private readonly productChannel = inject(PRODUCT_SHELL_CHANNEL, {
    optional: true,
  });

  publish(event: Omit<ProductShellEvent, 'source' | 'timestamp'>): void {
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
}
