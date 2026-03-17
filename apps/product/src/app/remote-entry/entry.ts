import { Component, OnInit, inject } from '@angular/core';
import { ProductStore } from '../stores/product.store';

@Component({
  imports: [],
  selector: 'app-product-entry',
  templateUrl: './entry.html',
})
export class RemoteEntry implements OnInit {
  readonly store = inject(ProductStore) as InstanceType<typeof ProductStore>;

  ngOnInit(): void {
    this.store.initialize();
  }
}
