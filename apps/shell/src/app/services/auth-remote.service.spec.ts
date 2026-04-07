import { TestBed } from '@angular/core/testing';
import {
  AUTH_EVENT_TYPES,
  AUTH_SHELL_CHANNEL,
  REMOTE_SOURCES,
  SESSION_STORAGE_KEYS,
  type AuthChannelEvent,
  type SessionState,
} from '@ecommerce-mf/session';
import { ShellRemoteChannelService } from './shell-remote-channel.service';
import { AuthRemoteService } from './auth-remote.service';

const createSession = (): SessionState => ({
  isAuthenticated: true,
  token: 'token-123',
  user: {
    id: 'user-1',
    name: 'Taylor',
    email: 'taylor@example.com',
    phoneNumber: '1234567890',
    roles: ['customer'],
  },
});

const publishAuthEvent = (
  channel: ShellRemoteChannelService<AuthChannelEvent>,
  type: string,
) => {
  channel.publish({
    source: REMOTE_SOURCES.AUTH,
    type,
    timestamp: Date.now(),
  });
};

describe('AuthRemoteService', () => {
  let channel: ShellRemoteChannelService<AuthChannelEvent>;

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    channel = new ShellRemoteChannelService<AuthChannelEvent>();

    TestBed.configureTestingModule({
      providers: [{ provide: AUTH_SHELL_CHANNEL, useValue: channel }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('restores the persisted auth session during construction', () => {
    localStorage.setItem(SESSION_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(createSession()));

    const service = TestBed.inject(AuthRemoteService);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.email).toBe('taylor@example.com');
    expect(service.authorizationHeader()).toBe('Bearer token-123');
  });

  it('clears invalid persisted session payloads', () => {
    localStorage.setItem(SESSION_STORAGE_KEYS.AUTH_SESSION, '{bad-json');

    const service = TestBed.inject(AuthRemoteService);

    expect(service.session()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.authorizationHeader()).toBeNull();
  });

  it('clears structurally invalid persisted sessions', () => {
    localStorage.setItem(
      SESSION_STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify({ isAuthenticated: true, user: null, token: null }),
    );

    const service = TestBed.inject(AuthRemoteService);

    expect(service.session()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('reloads session state on auth success events and clears it on logout', () => {
    const service = TestBed.inject(AuthRemoteService);
    const session = createSession();

    localStorage.setItem(SESSION_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    publishAuthEvent(channel, AUTH_EVENT_TYPES.LOGIN_SUCCESS);

    expect(service.session()).toEqual(session);

    publishAuthEvent(channel, AUTH_EVENT_TYPES.LOGOUT);

    expect(service.session()).toBeNull();
    expect(localStorage.getItem(SESSION_STORAGE_KEYS.AUTH_SESSION)).toBeNull();
  });

  it('refreshes from storage on remote ready and register success', () => {
    const service = TestBed.inject(AuthRemoteService);
    const session = createSession();

    localStorage.setItem(SESSION_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    publishAuthEvent(channel, AUTH_EVENT_TYPES.REMOTE_READY);

    expect(service.token()).toBe('token-123');

    localStorage.setItem(
      SESSION_STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify({ ...session, token: 'token-456' }),
    );
    publishAuthEvent(channel, AUTH_EVENT_TYPES.REGISTER_SUCCESS);

    expect(service.authorizationHeader()).toBe('Bearer token-456');
  });

  it('keeps state unchanged for login failed and unknown auth events', () => {
    const service = TestBed.inject(AuthRemoteService);

    publishAuthEvent(channel, AUTH_EVENT_TYPES.LOGIN_FAILED);
    publishAuthEvent(channel, 'unexpected-event');

    expect(service.session()).toBeNull();
    expect(console.log).toHaveBeenCalled();
  });
});