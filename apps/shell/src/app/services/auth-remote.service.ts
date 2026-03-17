import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {
  AUTH_SHELL_CHANNEL,
  AUTH_EVENT_TYPES,
  REMOTE_SOURCES,
  type AuthShellEvent,
  type ShellAuthEvent,
} from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class AuthRemoteService {
  private readonly authChannel = inject(AUTH_SHELL_CHANNEL, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
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
        console.log('[Shell ← Auth] Remote is ready');
        break;

      case AUTH_EVENT_TYPES.LOGIN_SUCCESS:
        console.log('[Shell ← Auth] Login succeeded', event.payload);
        break;

      case AUTH_EVENT_TYPES.LOGIN_FAILED:
        console.log('[Shell ← Auth] Login failed', event.payload);
        break;

      case AUTH_EVENT_TYPES.LOGOUT:
        console.log('[Shell ← Auth] User logged out', event.payload);
        break;

      case AUTH_EVENT_TYPES.REGISTER_SUCCESS:
        console.log('[Shell ← Auth] Registration succeeded', event.payload);
        break;

      default:
        console.log('[Shell ← Auth] Unknown event type:', event.type, event.payload);
    }
  }

  // ─── Send events to auth remote ─────────────────────────────────────────────

  private publishToAuth(event: Omit<ShellAuthEvent, 'source' | 'timestamp'>): void {
    this.authChannel?.publish({
      ...event,
      source: REMOTE_SOURCES.SHELL,
      timestamp: Date.now(),
    });
  }

  sendNavigateToLogin(redirectUrl?: string): void {
    this.publishToAuth({
      type: AUTH_EVENT_TYPES.NAVIGATE_TO_LOGIN,
      payload: { message: 'Navigate to the login page', redirectUrl },
    });
  }

  sendNavigateToRegister(): void {
    this.publishToAuth({
      type: AUTH_EVENT_TYPES.NAVIGATE_TO_REGISTER,
      payload: { message: 'Navigate to the register page' },
    });
  }

  sendSessionExpired(redirectUrl?: string): void {
    this.publishToAuth({
      type: AUTH_EVENT_TYPES.SESSION_EXPIRED,
      payload: { message: 'Session has expired, please log in again', redirectUrl },
    });
  }

  sendLogoutRequested(): void {
    this.publishToAuth({
      type: AUTH_EVENT_TYPES.LOGOUT_REQUESTED,
      payload: { message: 'Logout requested by shell' },
    });
  }
}
