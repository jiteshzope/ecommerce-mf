import { Injectable, inject } from '@angular/core';
import {
  AUTH_SHELL_CHANNEL,
  AUTH_EVENT_TYPES,
  REMOTE_SOURCES,
  SessionState,
  type AuthShellEvent,
} from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class AuthShellBridgeService {
  private readonly authChannel = inject(AUTH_SHELL_CHANNEL, { optional: true });

  // --- Send events to shell ----------------------------------------------------

  private publish(event: Omit<AuthShellEvent, 'source' | 'timestamp'>): void {
    this.authChannel?.publish({
      ...event,
      source: REMOTE_SOURCES.AUTH,
      timestamp: Date.now(),
    });
  }

  publishRemoteReady(): void {
    this.publish({
      type: AUTH_EVENT_TYPES.REMOTE_READY,
      payload: { message: 'Auth remote is ready' },
    });
  }

  publishLoginSuccess(email: string, session: SessionState, message = 'Login succeeded'): void {
    this.publish({
      type: AUTH_EVENT_TYPES.LOGIN_SUCCESS,
      payload: {
        message,
        email,
        session,
        authorizationHeader: `Bearer ${session.token}`,
      },
    });
  }

  publishLoginFailed(): void {
    this.publish({
      type: AUTH_EVENT_TYPES.LOGIN_FAILED,
      payload: { message: 'Login failed, invalid credentials' },
    });
  }

  publishLogout(email?: string): void {
    this.publish({
      type: AUTH_EVENT_TYPES.LOGOUT,
      payload: { message: 'User logged out', email },
    });
  }

  publishRegisterSuccess(email: string, session: SessionState): void {
    this.publish({
      type: AUTH_EVENT_TYPES.REGISTER_SUCCESS,
      payload: {
        message: 'Registration succeeded and user signed in',
        email,
        session,
        authorizationHeader: `Bearer ${session.token}`,
      },
    });
  }
}
