import { inject, DestroyRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { SESSION_STORAGE_KEYS, type SessionState } from '@ecommerce-mf/session';
import { CartApiService, type CartApiItem, type UpdateCartQuantityResponse } from '../services/cart-api.service';
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

    const applyItemMutation = (
      response: UpdateCartQuantityResponse,
      mode: 'increase' | 'decrease',
    ): void => {
      const responseProductId = Number(response.productId);
      const currentData = store.data();
      const existingItem = currentData.find((item) => Number(item.productId) === responseProductId);
      const shouldPublishCartUpdated =
        (mode === 'increase' && response.quantity === 1) ||
        mode === 'decrease' && (response.quantity <= 0 || response.removed);

      if (response.quantity <= 0 || response.removed) {
        const nextData = currentData.filter((item) => Number(item.productId) !== responseProductId);
        patchState(store, {
          data: nextData,
          empty: nextData.length === 0,
        });
        if (shouldPublishCartUpdated) {
          bridge.publishCartUpdated();
        }
        return;
      }

      const nextPrice = response.price ?? existingItem?.price ?? 0;
      const nextItem: CartApiItem = {
        id: response.id ?? existingItem?.id ?? Date.now(),
        productId: responseProductId,
        quantity: response.quantity,
        title: response.title ?? existingItem?.title ?? '',
        url: response.url ?? existingItem?.url ?? '',
        price: nextPrice,
        lineTotal: nextPrice * response.quantity,
      };

      const nextData = existingItem
        ? currentData.map((item) => (Number(item.productId) === responseProductId ? nextItem : item))
        : [nextItem, ...currentData];

      patchState(store, {
        data: nextData,
        empty: nextData.length === 0,
      });
      if (shouldPublishCartUpdated) {
        bridge.publishCartUpdated();
      }
    };

    const updateItemQuantity = async (
      productId: number,
      mode: 'increase' | 'decrease',
    ): Promise<void> => {
      const normalizedProductId = Number(productId);
      if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) {
        patchState(store, {
          error: CART_MESSAGES.FAILED_TO_LOAD,
        });
        return;
      }

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
      setMutatingProduct(normalizedProductId, true);

      try {
        let response: UpdateCartQuantityResponse;
        if (mode === 'increase') {
          response = await firstValueFrom(api.addCartItem(token, { productId: normalizedProductId, quantity: 1 }));
        } else {
          response = await firstValueFrom(api.removeCartItem(token, { productId: normalizedProductId, quantity: 1 }));
        }

        applyItemMutation(response, mode);
      } catch {
        patchState(store, {
          error:
            mode === 'increase'
              ? CART_MESSAGES.FAILED_TO_INCREASE_QUANTITY
              : CART_MESSAGES.FAILED_TO_DECREASE_QUANTITY,
        });
      } finally {
        setMutatingProduct(normalizedProductId, false);
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
