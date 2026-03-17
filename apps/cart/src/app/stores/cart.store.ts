import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { CartApiService, type CartApiItem } from '../services/cart-api.service';
import { CartShellBridgeService } from '../services/cart-shell-bridge.service';

interface CartState {
  data: CartApiItem[];
  loading: boolean;
  error: string | null;
  empty: boolean;
}

const initialState: CartState = {
  data: [],
  loading: false,
  error: null,
  empty: true,
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(CartApiService), bridge = inject(CartShellBridgeService)) => {
    const loadData = async (): Promise<void> => {
      patchState(store, { loading: true, error: null });

      try {
        const data = await firstValueFrom(api.getCartItems());
        patchState(store, {
          data,
          loading: false,
          empty: data.length === 0,
        });
        bridge.publishCartUpdated(data.length);
      } catch {
        patchState(store, {
          loading: false,
          error: 'Failed to load cart data.',
          data: [],
          empty: true,
        });
        bridge.publishCartCleared();
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
