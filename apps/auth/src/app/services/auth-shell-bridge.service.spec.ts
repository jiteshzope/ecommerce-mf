import { Subject } from 'rxjs';
import {
  AUTH_EVENT_TYPES,
  AUTH_SHELL_CHANNEL,
  REMOTE_SOURCES,
  type AuthChannelEvent,
} from '@ecommerce-mf/session';
import { TestBed } from '@angular/core/testing';
import { AuthShellBridgeService } from './auth-shell-bridge.service';

class MockAuthChannel<TEvent> {
  private readonly subject = new Subject<TEvent>();

  readonly events$ = this.subject.asObservable();

  publish(event: TEvent): void {
    this.subject.next(event);
  }
}

describe('AuthShellBridgeService', () => {
  it('publishes auth events to the shell channel with auth metadata', () => {
    const channel = new MockAuthChannel<AuthChannelEvent>();
    const published: AuthChannelEvent[] = [];

    channel.events$.subscribe((event) => published.push(event));

    TestBed.configureTestingModule({
      providers: [{ provide: AUTH_SHELL_CHANNEL, useValue: channel }],
    });

    const service = TestBed.inject(AuthShellBridgeService);
    service.publishRemoteReady();
    service.publishLoginSuccess();
    service.publishLoginFailed();
    service.publishLogout();
    service.publishRegisterSuccess();

    expect(published).toEqual([
      expect.objectContaining({ source: REMOTE_SOURCES.AUTH, type: AUTH_EVENT_TYPES.REMOTE_READY }),
      expect.objectContaining({ source: REMOTE_SOURCES.AUTH, type: AUTH_EVENT_TYPES.LOGIN_SUCCESS }),
      expect.objectContaining({ source: REMOTE_SOURCES.AUTH, type: AUTH_EVENT_TYPES.LOGIN_FAILED }),
      expect.objectContaining({ source: REMOTE_SOURCES.AUTH, type: AUTH_EVENT_TYPES.LOGOUT }),
      expect.objectContaining({ source: REMOTE_SOURCES.AUTH, type: AUTH_EVENT_TYPES.REGISTER_SUCCESS }),
    ]);
  });
});