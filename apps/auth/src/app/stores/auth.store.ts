import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { LoginRequest, SessionState, SESSION_STORAGE_KEYS } from '@ecommerce-mf/session';
import {
  AuthApiService,
  type AuthApiResponse,
  type AuthUser,
  type RegisterApiRequest,
} from '../services/auth-api.service';
import { AuthShellBridgeService } from '../services/auth-shell-bridge.service';
import { AUTH_MESSAGES } from '../constants/auth-constants';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isSubmitting: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(AuthApiService), bridge = inject(AuthShellBridgeService)) => {
    const createSession = (user: AuthUser, accessToken: string): SessionState => ({
      isAuthenticated: true,
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        roles: ['customer'],
      },
    });

    const persistSession = (session: SessionState): void => {
      try {
        localStorage.setItem(SESSION_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
      } catch {
        // Ignore storage failures to avoid blocking authentication flow.
      }
    };

    const clearPersistedSession = (): void => {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEYS.AUTH_SESSION);
      } catch {
        // Ignore storage failures to avoid blocking logout flow.
      }
    };

    const readPersistedSession = (): SessionState | null => {
      try {
        const rawSession = localStorage.getItem(SESSION_STORAGE_KEYS.AUTH_SESSION);
        if (!rawSession) {
          return null;
        }

        const parsed = JSON.parse(rawSession) as SessionState;
        if (!parsed?.isAuthenticated || !parsed.user || !parsed.token) {
          return null;
        }

        return parsed;
      } catch {
        return null;
      }
    };

    const applySuccess = (response: AuthApiResponse): void => {
      const session = createSession(response.user, response.accessToken);

      patchState(store, {
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isSubmitting: false,
        error: null,
      });

      persistSession(session);
    };

    const applyFailure = (message: string): void => {
      patchState(store, {
        isSubmitting: false,
        error: message,
      });
    };

    const readErrorCode = (error: unknown): string | null => {
      if (error instanceof HttpErrorResponse && error.error && typeof error.error === 'object') {
        const payload = error.error as { message?: unknown };
        return typeof payload.message === 'string' ? payload.message : null;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return null;
    };

    return {
      initialize(): void {
        bridge.publishRemoteReady();

        const persistedSession = readPersistedSession();
        if (!persistedSession?.user || !persistedSession.token) {
          return;
        }

        patchState(store, {
          user: {
            id: persistedSession.user.id,
            name: persistedSession.user.name,
            email: persistedSession.user.email,
            phoneNumber: persistedSession.user.phoneNumber ?? '',
          },
          accessToken: persistedSession.token,
          isAuthenticated: true,
          error: null,
        });

        bridge.publishLoginSuccess();
      },

      /**
       * Re-reads localStorage and syncs in-memory state without publishing bridge events.
       * Call this on navigating to login/register to avoid stale isAuthenticated signals
       * left over from a previous session that was cleared via shell logout.
       */
      syncFromStorage(): void {
        const session = readPersistedSession();
        if (session?.isAuthenticated && session.user && session.token) {
          patchState(store, {
            user: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              phoneNumber: session.user.phoneNumber ?? '',
            },
            accessToken: session.token,
            isAuthenticated: true,
            error: null,
          });
        } else {
          patchState(store, {
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      async login(request: LoginRequest): Promise<boolean> {
        patchState(store, {
          isSubmitting: true,
          error: null,
        });

        try {
          const response = await firstValueFrom(api.login(request));
          applySuccess(response);
          bridge.publishLoginSuccess();
          return true;
        } catch {
          applyFailure(AUTH_MESSAGES.INVALID_LOGIN);
          bridge.publishLoginFailed();
          return false;
        }
      },

      async register(request: RegisterApiRequest): Promise<boolean> {
        patchState(store, {
          isSubmitting: true,
          error: null,
        });

        try {
          const response = await firstValueFrom(api.register(request));
          applySuccess(response);
          bridge.publishRegisterSuccess();
          return true;
        } catch (error) {
          const errorCode = readErrorCode(error);
          const message =
            errorCode === 'EMAIL_IN_USE'
              ? AUTH_MESSAGES.EMAIL_IN_USE
              : AUTH_MESSAGES.REGISTER_FAILED;

          applyFailure(message);
          return false;
        }
      },

      logout(): void {
        const currentAccessToken = store.accessToken();
        if (currentAccessToken) {
          api.logout().subscribe({
            error: () => {
              // Logout is best-effort. Local session is always cleared.
            },
          });
        }

        patchState(store, {
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null,
        });
        clearPersistedSession();
        bridge.publishLogout();
      },

      clearError(): void {
        patchState(store, { error: null });
      },
    };
  }),
);
