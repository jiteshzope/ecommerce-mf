import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Router } from '@angular/router';
import { SessionState, type SessionUser } from '@ecommerce-mf/session';
import { AuthRemoteService } from '../services/auth-remote.service';
import { CartRemoteService } from '../services/cart-remote.service';

interface ShellState {
  authSession: SessionState | null;
  isAuthenticated: boolean;
  user: SessionUser | null;
  token: string | null;
}

const initialState: ShellState = {
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
      authRemote = inject(AuthRemoteService),
      cartRemote = inject(CartRemoteService),
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
    }),
  ),
);
