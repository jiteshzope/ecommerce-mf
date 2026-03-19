import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductStore } from '../stores/product.store';
import { PRODUCT_APP_LABELS } from '../constants/product-constants';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetails implements OnInit {
  readonly store = inject(ProductStore) as InstanceType<typeof ProductStore>;
  readonly labels = PRODUCT_APP_LABELS;

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private selectedId: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const productId = params.get('id');
      if (!productId || productId === this.selectedId) {
        return;
      }

      this.selectedId = productId;
      void this.store.loadProductDetails(productId);
    });
  }

  async onAddToCart(): Promise<void> {
    if (!this.selectedId) {
      return;
    }

    await this.store.addToCart(this.selectedId, 1);
  }

  onRetryDetails(): void {
    if (!this.selectedId) {
      return;
    }

    void this.store.loadProductDetails(this.selectedId);
  }
}
