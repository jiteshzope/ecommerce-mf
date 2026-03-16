import { Injectable, inject } from '@angular/core';
import { AUTH_SHELL_CHANNEL, type AuthShellEvent } from '@ecommerce-mf/session';

@Injectable({ providedIn: 'root' })
export class AuthShellBridgeService {
  private readonly authChannel = inject(AUTH_SHELL_CHANNEL, { optional: true });

  publish(event: Omit<AuthShellEvent, 'source' | 'timestamp'>): void {
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
}
