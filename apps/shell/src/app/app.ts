import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AUTH_SHELL_CHANNEL,
  CART_SHELL_CHANNEL,
  PRODUCT_SHELL_CHANNEL,
  type AnyShellEvent,
} from '@ecommerce-mf/session';
import { RouterModule } from '@angular/router';
import { merge } from 'rxjs';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'shell';

  readonly receivedEvents: AnyShellEvent[] = [];

  private readonly destroyRef = inject(DestroyRef);
  private readonly authChannel = inject(AUTH_SHELL_CHANNEL, { optional: true });
  private readonly cartChannel = inject(CART_SHELL_CHANNEL, { optional: true });
  private readonly productChannel = inject(PRODUCT_SHELL_CHANNEL, {
    optional: true,
  });

  constructor() {
    if (!this.authChannel || !this.cartChannel || !this.productChannel) {
      return;
    }

    merge(
      this.authChannel.events$,
      this.cartChannel.events$,
      this.productChannel.events$,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.receivedEvents.push(event);
      });
  }
}
