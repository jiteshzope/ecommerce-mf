import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductStore } from '../stores/product.store';

@Component({
  imports: [RouterOutlet],
  selector: 'app-product-entry',
  templateUrl: './entry.html',
  styleUrls: ['./entry.scss'],
})
export class RemoteEntry implements OnInit {
  readonly store = inject(ProductStore) as InstanceType<typeof ProductStore>;

  ngOnInit(): void {
    this.store.initialize();
  }

  onRefresh(): void {
    this.store.initialize();
  }
}
