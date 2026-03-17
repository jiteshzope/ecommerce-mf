import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AuthApiService, type AuthApiUser } from '../services/auth-api.service';
import { AuthShellBridgeService } from '../services/auth-shell-bridge.service';

interface AuthState {
  data: AuthApiUser[];
  loading: boolean;
  error: string | null;
  empty: boolean;
}

const initialState: AuthState = {
  data: [],
  loading: false,
  error: null,
  empty: true,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(AuthApiService), bridge = inject(AuthShellBridgeService)) => {
    const loadData = async (): Promise<void> => {
      patchState(store, { loading: true, error: null });

      try {
        const data = await firstValueFrom(api.getUsers());
        patchState(store, {
          data,
          loading: false,
          empty: data.length === 0,
        });
        bridge.publishLoginSuccess(data[0]?.email ?? 'demo@local.dev');
      } catch {
        patchState(store, {
          loading: false,
          error: 'Failed to load auth data.',
          data: [],
          empty: true,
        });
        bridge.publishLoginFailed();
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
