import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Router } from '@angular/router';
import { SessionState, type SessionUser } from '@ecommerce-mf/session';
import { AuthRemoteService } from '../services/auth-remote.service';
import { ShellApiService } from '../services/shell-api.service';

interface ShellState {
  authSession: SessionState | null;
  isAuthenticated: boolean;
  user: SessionUser | null;
  token: string | null;
  cartItemCount: number;
}

const initialState: ShellState = {
  authSession: null,
  isAuthenticated: false,
  user: null,
  token: null,
  cartItemCount: 0,
};

export const ShellStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      authRemote = inject(AuthRemoteService),
      shellApi = inject(ShellApiService),
      router = inject(Router),
    ) => ({
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
          cartItemCount: 0,
        });
      },

      setCartItemCount(cartItemCount: number): void {
        patchState(store, {
          cartItemCount: Math.max(0, cartItemCount),
        });
      },

      async loadCartItemCount(): Promise<void> {
        if (!store.isAuthenticated()) {
          patchState(store, { cartItemCount: 0 });
          return;
        }

        try {
          const cartItemCount = await firstValueFrom(shellApi.getCartItemCount(store.token()!));

          if (!store.isAuthenticated()) {
            return;
          }

          patchState(store, {
            cartItemCount: Math.max(0, cartItemCount),
          });
        } catch {
          if (!store.isAuthenticated()) {
            return;
          }

          patchState(store, { cartItemCount: 0 });
        }
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
          cartItemCount: 0,
        });
        void router.navigateByUrl('/product');
      },
    }),
  ),
);
