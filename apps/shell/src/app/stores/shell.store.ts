import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Router } from '@angular/router';
import { SessionState, type SessionUser } from '@ecommerce-mf/session';
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
  authSession: SessionState | null;
  isAuthenticated: boolean;
  user: SessionUser | null;
  token: string | null;
}

const initialState: ShellState = {
  data: [],
  loading: false,
  error: null,
  empty: true,
  authSession: null,
  isAuthenticated: false,
  user: null,
  token: null,
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
      router = inject(Router),
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

      setAuthSession(session: SessionState): void {
        patchState(store, {
          authSession: session,
          isAuthenticated: session.isAuthenticated,
          user: session.user,
          token: session.token,
        });
      },

      clearAuthSession(): void {
        patchState(store, {
          authSession: null,
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },

      getAuthorizationHeader(): string | null {
        const token = store.token();
        return token ? `Bearer ${token}` : null;
      },

      goToLogin(): void {
        void router.navigateByUrl('/auth/login');
      },

      goToRegister(): void {
        void router.navigateByUrl('/auth/register');
      },

      logout(): void {
        authRemote.clearSession();
        patchState(store, {
          authSession: null,
          isAuthenticated: false,
          user: null,
          token: null,
        });
        void router.navigateByUrl('/');
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
