import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CartStore } from '../../stores/cart.store';

@Component({
  selector: 'app-cart-items-list',
  imports: [DecimalPipe],
  templateUrl: './cart-items-list.component.html',
  styleUrl: './cart-items-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemsListComponent implements OnInit {
  readonly store = inject(CartStore) as InstanceType<typeof CartStore>;

  ngOnInit(): void {
    this.store.initialize();
  }
}
