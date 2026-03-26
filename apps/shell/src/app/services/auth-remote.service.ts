import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {
  AUTH_SHELL_CHANNEL,
  AUTH_EVENT_TYPES,
  REMOTE_SOURCES,
  SESSION_STORAGE_KEYS,
  type SessionState,
  type AuthShellEvent,
} from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class AuthRemoteService {
  private readonly authChannel = inject(AUTH_SHELL_CHANNEL, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionState = signal<SessionState | null>(null);

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionState()?.isAuthenticated ?? false);
  readonly user = computed(() => this.sessionState()?.user ?? null);
  readonly token = computed(() => this.sessionState()?.token ?? null);
  readonly authorizationHeader = computed(() => {
    const token = this.token();
    return token ? `Bearer ${token}` : null;
  });

  constructor() {
    this.restorePersistedSession();

    this.authChannel?.events$
      .pipe(
        filter((event): event is AuthShellEvent => event.source === REMOTE_SOURCES.AUTH),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.handleAuthEvent(event));
  }

  // ─── Receive events from auth remote ────────────────────────────────────────

  private handleAuthEvent(event: AuthShellEvent): void {
    switch (event.type) {
      case AUTH_EVENT_TYPES.REMOTE_READY:
        this.restorePersistedSession();
        console.log('[Shell ← Auth] Remote is ready');
        break;

      case AUTH_EVENT_TYPES.LOGIN_SUCCESS:
        this.restorePersistedSession();
        console.log('[Shell ← Auth] Login succeeded');
        break;

      case AUTH_EVENT_TYPES.LOGIN_FAILED:
        console.log('[Shell ← Auth] Login failed');
        break;

      case AUTH_EVENT_TYPES.LOGOUT:
        this.clearSession();
        console.log('[Shell ← Auth] User logged out');
        break;

      case AUTH_EVENT_TYPES.REGISTER_SUCCESS:
        this.restorePersistedSession();
        console.log('[Shell ← Auth] Registration succeeded');
        break;

      default:
        console.log('[Shell ← Auth] Unknown event type:', event.type);
    }
  }

  private setSession(session: SessionState): void {
    this.sessionState.set(session);
  }

  clearSession(): void {
    this.sessionState.set(null);

    try {
      // Also clear the auth MFE's persisted session so it does not restore on app reload.
      localStorage.removeItem(SESSION_STORAGE_KEYS.AUTH_SESSION);
    } catch {
      // Ignore storage failures to avoid breaking logout flow.
    }
  }

  private restorePersistedSession(): void {
    try {
      const rawSession = localStorage.getItem(SESSION_STORAGE_KEYS.AUTH_SESSION);
      if (!rawSession) {
        this.sessionState.set(null);
        return;
      }

      const parsedSession = JSON.parse(rawSession) as SessionState;
      if (!parsedSession?.isAuthenticated || !parsedSession.user || !parsedSession.token) {
        this.sessionState.set(null);
        return;
      }

      this.sessionState.set(parsedSession);
    } catch {
      this.sessionState.set(null);
    }
  }
}
