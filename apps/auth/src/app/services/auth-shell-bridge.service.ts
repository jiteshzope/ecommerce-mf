import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {
  AUTH_SHELL_CHANNEL,
  type AuthShellEvent,
  type ShellAuthEvent,
} from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class AuthShellBridgeService {
  private readonly authChannel = inject(AUTH_SHELL_CHANNEL, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Subscribe to events arriving from the shell
    this.authChannel?.events$
      .pipe(
        filter((event): event is ShellAuthEvent => event.source === 'shell'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.handleShellEvent(event));
  }

  // ─── Receive events from shell ───────────────────────────────────────────────

  private handleShellEvent(event: ShellAuthEvent): void {
    switch (event.type) {
      case 'navigate-to-login':
        console.log('[Auth ← Shell] Navigate to login', event.payload);
        break;

      case 'navigate-to-register':
        console.log('[Auth ← Shell] Navigate to register');
        break;

      case 'session-expired':
        console.log('[Auth ← Shell] Session expired', event.payload);
        break;

      case 'logout-requested':
        console.log('[Auth ← Shell] Logout requested');
        break;

      default:
        console.log('[Auth ← Shell] Unknown event type:', event.type, event.payload);
    }
  }

  // ─── Send events to shell ────────────────────────────────────────────────────

  private publish(event: Omit<AuthShellEvent, 'source' | 'timestamp'>): void {
    this.authChannel?.publish({
      ...event,
      source: 'auth',
      timestamp: Date.now(),
    });
  }

  publishRemoteReady(): void {
    this.publish({
      type: 'remote-ready',
      payload: { message: 'Auth remote is ready' },
    });
  }

  publishLoginSuccess(email: string): void {
    this.publish({
      type: 'login-success',
      payload: { message: 'Login succeeded', email },
    });
  }

  publishLoginFailed(): void {
    this.publish({
      type: 'login-failed',
      payload: { message: 'Login failed, invalid credentials' },
    });
  }

  publishLogout(email?: string): void {
    this.publish({
      type: 'logout',
      payload: { message: 'User logged out', email },
    });
  }

  publishRegisterSuccess(email: string): void {
    this.publish({
      type: 'register-success',
      payload: { message: 'Registration succeeded', email },
    });
  }
}
