import { Component, OnInit, inject } from '@angular/core';
import { CartStore } from '../stores/cart.store';

@Component({
  imports: [],
  selector: 'app-cart-entry',
  templateUrl: './entry.html',
})
export class RemoteEntry implements OnInit {
  readonly store = inject(CartStore) as InstanceType<typeof CartStore>;

  ngOnInit(): void {
    this.store.initialize();
  }
}
