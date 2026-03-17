import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { PRODUCT_EVENT_TYPES } from '@ecommerce-mf/session';
import {
  ProductApiService,
  type ProductApiItem,
} from '../services/product-api.service';
import { ProductShellBridgeService } from '../services/product-shell-bridge.service';
import { PRODUCT_MESSAGES } from '../constants/product-constants';

interface ProductState {
  data: ProductApiItem[];
  loading: boolean;
  error: string | null;
  empty: boolean;
}

const initialState: ProductState = {
  data: [],
  loading: false,
  error: null,
  empty: true,
};

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(ProductApiService), bridge = inject(ProductShellBridgeService)) => {
    const loadData = async (): Promise<void> => {
        patchState(store, { loading: true, error: null });

        try {
          const data = await firstValueFrom(api.getProducts());
          patchState(store, {
            data,
            loading: false,
            empty: data.length === 0,
          });
          if (data[0]?.id) {
            bridge.publishProductViewed(String(data[0].id));
          }
        } catch {
          patchState(store, {
            loading: false,
            error: PRODUCT_MESSAGES.FAILED_TO_LOAD,
            data: [],
            empty: true,
          });
        }
    };

    return {
      loadData,

      initialize(): void {
        bridge.publishRemoteReady();
        void loadData();
      },

      clearError(): void {
        patchState(store, { error: null });
      },
    };
  }),
);
