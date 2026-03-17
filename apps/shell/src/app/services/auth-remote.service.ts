import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {
  AUTH_SHELL_CHANNEL,
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
        filter((event): event is AuthShellEvent => event.source === 'auth'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.handleAuthEvent(event));
  }

  // ─── Receive events from auth remote ────────────────────────────────────────

  private handleAuthEvent(event: AuthShellEvent): void {
    switch (event.type) {
      case 'remote-ready':
        console.log('[Shell ← Auth] Remote is ready');
        break;

      case 'login-success':
        console.log('[Shell ← Auth] Login succeeded', event.payload);
        break;

      case 'login-failed':
        console.log('[Shell ← Auth] Login failed', event.payload);
        break;

      case 'logout':
        console.log('[Shell ← Auth] User logged out', event.payload);
        break;

      case 'register-success':
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
      source: 'shell',
      timestamp: Date.now(),
    });
  }

  sendNavigateToLogin(redirectUrl?: string): void {
    this.publishToAuth({
      type: 'navigate-to-login',
      payload: { message: 'Navigate to the login page', redirectUrl },
    });
  }

  sendNavigateToRegister(): void {
    this.publishToAuth({
      type: 'navigate-to-register',
      payload: { message: 'Navigate to the register page' },
    });
  }

  sendSessionExpired(redirectUrl?: string): void {
    this.publishToAuth({
      type: 'session-expired',
      payload: { message: 'Session has expired, please log in again', redirectUrl },
    });
  }

  sendLogoutRequested(): void {
    this.publishToAuth({
      type: 'logout-requested',
      payload: { message: 'Logout requested by shell' },
    });
  }
}
