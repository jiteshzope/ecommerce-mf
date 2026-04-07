import { HttpClient, HttpHeaders, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SESSION_STORAGE_KEYS, type SessionState } from '@ecommerce-mf/session';
import { environment } from '../../environments/environment';
import { authTokenInterceptor } from './auth-token.interceptor';

const createSession = (token = 'token-123'): SessionState => ({
  isAuthenticated: true,
  token,
  user: {
    id: 'user-1',
    name: 'Taylor',
    email: 'taylor@example.com',
    phoneNumber: '1234567890',
    roles: ['customer'],
  },
});

describe('authTokenInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('adds the bearer token to auth API requests when a session exists', () => {
    localStorage.setItem(SESSION_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(createSession()));

    http.post(`${environment.authApiBaseUrl}/auth/logout`, {}).subscribe();

    const request = httpTesting.expectOne(`${environment.authApiBaseUrl}/auth/logout`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-123');
    request.flush({});
  });

  it('does not overwrite explicit headers or decorate unrelated requests', () => {
    localStorage.setItem(SESSION_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(createSession()));

    http.get('/assets/config.json').subscribe();
    http
      .post(
        `${environment.authApiBaseUrl}/auth/logout`,
        {},
        { headers: new HttpHeaders({ Authorization: 'Bearer existing-token' }) },
      )
      .subscribe();

    const assetRequest = httpTesting.expectOne('/assets/config.json');
    const apiRequest = httpTesting.expectOne(`${environment.authApiBaseUrl}/auth/logout`);

    expect(assetRequest.request.headers.has('Authorization')).toBe(false);
    expect(apiRequest.request.headers.get('Authorization')).toBe('Bearer existing-token');
    assetRequest.flush({});
    apiRequest.flush({});
  });
});