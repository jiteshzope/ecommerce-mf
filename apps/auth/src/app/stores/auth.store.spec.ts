import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SESSION_STORAGE_KEYS, type SessionState } from '@ecommerce-mf/session';
import { AUTH_MESSAGES } from '../constants/auth-constants';
import { AuthApiService, type AuthApiResponse } from '../services/auth-api.service';
import { AuthShellBridgeService } from '../services/auth-shell-bridge.service';
import { AuthStore } from './auth.store';

const createResponse = (token = 'token-123'): AuthApiResponse => ({
  accessToken: token,
  user: {
    id: 'user-1',
    name: 'Taylor',
    email: 'taylor@example.com',
    phoneNumber: '+12345678901',
  },
});

const readSession = (): SessionState | null => {
  const raw = localStorage.getItem(SESSION_STORAGE_KEYS.AUTH_SESSION);
  return raw ? (JSON.parse(raw) as SessionState) : null;
};

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let api: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let bridge: {
    publishRemoteReady: ReturnType<typeof vi.fn>;
    publishLoginSuccess: ReturnType<typeof vi.fn>;
    publishLoginFailed: ReturnType<typeof vi.fn>;
    publishLogout: ReturnType<typeof vi.fn>;
    publishRegisterSuccess: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();
    api = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };
    bridge = {
      publishRemoteReady: vi.fn(),
      publishLoginSuccess: vi.fn(),
      publishLoginFailed: vi.fn(),
      publishLogout: vi.fn(),
      publishRegisterSuccess: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthApiService, useValue: api },
        { provide: AuthShellBridgeService, useValue: bridge },
      ],
    });

    store = TestBed.inject(AuthStore) as InstanceType<typeof AuthStore>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes from persisted session and notifies the shell bridge', () => {
    localStorage.setItem(
      SESSION_STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify({
        isAuthenticated: true,
        token: 'token-123',
        user: {
          id: 'user-1',
          name: 'Taylor',
          email: 'taylor@example.com',
          phoneNumber: '+12345678901',
          roles: ['customer'],
        },
      }),
    );

    store.initialize();

    expect(bridge.publishRemoteReady).toHaveBeenCalledTimes(1);
    expect(bridge.publishLoginSuccess).toHaveBeenCalledTimes(1);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.accessToken()).toBe('token-123');
    expect(store.user()?.email).toBe('taylor@example.com');
  });

  it('syncs state from storage and clears stale auth state when session is absent', () => {
    localStorage.setItem(SESSION_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(readSession()));
    store.syncFromStorage();
    expect(store.isAuthenticated()).toBe(false);

    localStorage.setItem(
      SESSION_STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify({
        isAuthenticated: true,
        token: 'token-456',
        user: {
          id: 'user-2',
          name: 'Jordan',
          email: 'jordan@example.com',
          phoneNumber: '',
          roles: ['customer'],
        },
      }),
    );

    store.syncFromStorage();

    expect(store.isAuthenticated()).toBe(true);
    expect(store.accessToken()).toBe('token-456');
    expect(store.user()?.name).toBe('Jordan');
  });

  it('logs in successfully, persists the session, and notifies the shell', async () => {
    api.login.mockReturnValue(of(createResponse()));

    const result = await store.login({ email: 'test@example.com', password: 'Password123' });

    expect(result).toBe(true);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.error()).toBeNull();
    expect(readSession()?.token).toBe('token-123');
    expect(bridge.publishLoginSuccess).toHaveBeenCalledTimes(1);
  });

  it('maps login failures to the invalid-login message and publishes failure', async () => {
    api.login.mockReturnValue(throwError(() => new Error('boom')));

    const result = await store.login({ email: 'test@example.com', password: 'Password123' });

    expect(result).toBe(false);
    expect(store.error()).toBe(AUTH_MESSAGES.INVALID_LOGIN);
    expect(store.isSubmitting()).toBe(false);
    expect(bridge.publishLoginFailed).toHaveBeenCalledTimes(1);
  });

  it('registers successfully, persists the session, and publishes register success', async () => {
    api.register.mockReturnValue(of(createResponse('token-789')));

    const result = await store.register({
      name: 'Taylor',
      email: 'test@example.com',
      phoneNumber: '+12345678901',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    expect(result).toBe(true);
    expect(store.isAuthenticated()).toBe(true);
    expect(readSession()?.token).toBe('token-789');
    expect(bridge.publishRegisterSuccess).toHaveBeenCalledTimes(1);
  });

  it('maps register API errors to email-in-use and generic fallback messages', async () => {
    api.register.mockReturnValueOnce(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'EMAIL_IN_USE' } })),
    );

    const emailInUse = await store.register({
      name: 'Taylor',
      email: 'test@example.com',
      phoneNumber: '+12345678901',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    expect(emailInUse).toBe(false);
    expect(store.error()).toBe(AUTH_MESSAGES.EMAIL_IN_USE);

    api.register.mockReturnValueOnce(throwError(() => new Error('boom')));

    const genericFailure = await store.register({
      name: 'Taylor',
      email: 'test@example.com',
      phoneNumber: '+12345678901',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    expect(genericFailure).toBe(false);
    expect(store.error()).toBe(AUTH_MESSAGES.REGISTER_FAILED);
  });

  it('logs out with a token, clears state, clears storage, and publishes logout', () => {
    localStorage.setItem(
      SESSION_STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify({
        isAuthenticated: true,
        token: 'token-123',
        user: {
          id: 'user-1',
          name: 'Taylor',
          email: 'taylor@example.com',
          phoneNumber: '+12345678901',
          roles: ['customer'],
        },
      }),
    );
    api.logout.mockReturnValue(of(undefined));

    store.initialize();
    store.logout();

    expect(api.logout).toHaveBeenCalledTimes(1);
    expect(store.isAuthenticated()).toBe(false);
    expect(store.accessToken()).toBeNull();
    expect(store.user()).toBeNull();
    expect(localStorage.getItem(SESSION_STORAGE_KEYS.AUTH_SESSION)).toBeNull();
    expect(bridge.publishLogout).toHaveBeenCalledTimes(1);
  });

  it('still clears local state and publishes logout when no token exists', () => {
    store.logout();

    expect(api.logout).not.toHaveBeenCalled();
    expect(store.isAuthenticated()).toBe(false);
    expect(bridge.publishLogout).toHaveBeenCalledTimes(1);
  });

  it('clears the current error message', async () => {
    api.login.mockReturnValue(throwError(() => new Error('boom')));
    await store.login({ email: 'test@example.com', password: 'Password123' });

    expect(store.error()).toBe(AUTH_MESSAGES.INVALID_LOGIN);

    store.clearError();

    expect(store.error()).toBeNull();
  });
});
