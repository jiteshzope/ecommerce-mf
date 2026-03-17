import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AuthRemoteService } from '../services/auth-remote.service';
import { CartRemoteService } from '../services/cart-remote.service';
import { ProductRemoteService } from '../services/product-remote.service';
import { ShellApiService, type ShellDashboardItem } from '../services/shell-api.service';
import { SHELL_MESSAGES } from '../constants/shell-constants';

interface ShellState {
  data: ShellDashboardItem[];
  loading: boolean;
  error: string | null;
  empty: boolean;
}

const initialState: ShellState = {
  data: [],
  loading: false,
  error: null,
  empty: true,
};

export const ShellStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      api = inject(ShellApiService),
      authRemote = inject(AuthRemoteService),
      cartRemote = inject(CartRemoteService),
      productRemote = inject(ProductRemoteService),
    ) => ({
      async loadData(): Promise<void> {
        patchState(store, { loading: true, error: null });

        try {
          const data = await firstValueFrom(api.getDashboardData());
          patchState(store, {
            data,
            loading: false,
            empty: data.length === 0,
          });
        } catch {
          patchState(store, {
            loading: false,
            error: SHELL_MESSAGES.FAILED_TO_LOAD,
            data: [],
            empty: true,
          });
        }
      },

      clearError(): void {
        patchState(store, { error: null });
      },

      sendAuthLoginRedirect(): void {
        authRemote.sendNavigateToLogin('/');
      },

      addDemoCartItem(): void {
        cartRemote.sendAddItem('product-101', 1);
      },

      loadDemoProduct(): void {
        productRemote.sendLoadProduct('101');
      },
    }),
  ),
);
