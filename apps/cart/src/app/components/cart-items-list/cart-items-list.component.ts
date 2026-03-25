import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../stores/cart.store';

@Component({
  selector: 'app-cart-items-list',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './cart-items-list.component.html',
  styleUrl: './cart-items-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemsListComponent implements OnInit {
  readonly store = inject(CartStore) as InstanceType<typeof CartStore>;

  ngOnInit(): void {
    this.store.initialize();
  }

  async increaseQuantity(productId: number): Promise<void> {
    await this.store.increaseItemQuantity(productId);
  }

  async decreaseQuantity(productId: number): Promise<void> {
    await this.store.decreaseItemQuantity(productId);
  }
}
