import { inject, DestroyRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { SESSION_STORAGE_KEYS, type SessionState } from '@ecommerce-mf/session';
import { CartApiService, type CartApiItem } from '../services/cart-api.service';
import { CartShellBridgeService } from '../services/cart-shell-bridge.service';
import { CART_MESSAGES } from '../constants/cart-constants';

interface CartState {
  data: CartApiItem[];
  loading: boolean;
  mutatingProductIds: number[];
  error: string | null;
  empty: boolean;
}

const initialState: CartState = {
  data: [],
  loading: false,
  mutatingProductIds: [],
  error: null,
  empty: true,
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(CartApiService), bridge = inject(CartShellBridgeService), destroyRef = inject(DestroyRef)) => {
    const readAccessToken = (): string | null => {
      try {
        const rawSession = localStorage.getItem(SESSION_STORAGE_KEYS.AUTH_SESSION);
        if (!rawSession) return null;
        const session = JSON.parse(rawSession) as SessionState;
        return session?.isAuthenticated && session.token ? session.token : null;
      } catch {
        return null;
      }
    };

    const loadData = async (): Promise<void> => {
      patchState(store, { loading: true, error: null });

      const token = readAccessToken();
      if (!token) {
        patchState(store, { loading: false, data: [], empty: true });
        return;
      }

      try {
        const data = await firstValueFrom(api.getCartItems(token));
        patchState(store, {
          data,
          loading: false,
          empty: data.length === 0,
        });
        bridge.publishCartUpdated(data.length);
      } catch {
        patchState(store, {
          loading: false,
          error: CART_MESSAGES.FAILED_TO_LOAD,
          data: [],
          empty: true,
        });
        bridge.publishCartCleared();
      }
    };

    const setMutatingProduct = (productId: number, active: boolean): void => {
      const current = store.mutatingProductIds();
      const next = active
        ? [...new Set([...current, productId])]
        : current.filter((id) => id !== productId);
      patchState(store, { mutatingProductIds: next });
    };

    const updateItemQuantity = async (
      productId: number,
      mode: 'increase' | 'decrease',
    ): Promise<void> => {
      const token = readAccessToken();
      if (!token) {
        patchState(store, {
          data: [],
          empty: true,
          error: CART_MESSAGES.FAILED_TO_LOAD,
        });
        return;
      }

      patchState(store, { error: null });
      setMutatingProduct(productId, true);

      try {
        if (mode === 'increase') {
          await firstValueFrom(api.addCartItem(token, { productId, quantity: 1 }));
        } else {
          await firstValueFrom(api.removeCartItem(token, { productId, quantity: 1 }));
        }

        await loadData();
      } catch {
        patchState(store, {
          error:
            mode === 'increase'
              ? CART_MESSAGES.FAILED_TO_INCREASE_QUANTITY
              : CART_MESSAGES.FAILED_TO_DECREASE_QUANTITY,
        });
      } finally {
        setMutatingProduct(productId, false);
      }
    };

    // Clear cart state when shell signals logout so the next user starts with a clean cart.
    bridge.clearCart$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      patchState(store, { data: [], loading: false, mutatingProductIds: [], error: null, empty: true });
      bridge.publishCartCleared();
    });

    return {
      loadData,

      increaseItemQuantity(productId: number): Promise<void> {
        return updateItemQuantity(productId, 'increase');
      },

      decreaseItemQuantity(productId: number): Promise<void> {
        return updateItemQuantity(productId, 'decrease');
      },

      isItemMutating(productId: number): boolean {
        return store.mutatingProductIds().includes(productId);
      },

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
