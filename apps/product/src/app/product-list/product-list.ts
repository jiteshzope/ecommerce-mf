import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductStore } from '../stores/product.store';
import { PRODUCT_APP_LABELS } from '../constants/product-constants';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList implements OnInit {
  readonly store = inject(ProductStore) as InstanceType<typeof ProductStore>;
  readonly labels = PRODUCT_APP_LABELS;

  ngOnInit(): void {
    this.store.clearSelectedProduct();
    void this.store.loadProducts();
  }

  async onAddToCart(productId: number): Promise<void> {
    await this.store.addToCart(String(productId), 1);
  }

  onSelectProduct(productId: number): void {
    this.store.markProductSelected(String(productId));
  }
}
