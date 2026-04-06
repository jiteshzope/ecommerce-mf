import { HttpInterceptorFn } from '@angular/common/http';
import { SESSION_STORAGE_KEYS, type SessionState } from '@ecommerce-mf/session';
import { environment } from '../../environments/environment';

const apiBaseUrl = environment.authApiBaseUrl.replace(/\/+$/, '');

const readAccessToken = (): string | null => {
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEYS.AUTH_SESSION);
    if (!rawSession) {
      return null;
    }

    const session = JSON.parse(rawSession) as SessionState;
    return session?.isAuthenticated && session.token ? session.token : null;
  } catch {
    return null;
  }
};

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(apiBaseUrl) || req.headers.has('Authorization')) {
    return next(req);
  }

  const accessToken = readAccessToken();
  if (!accessToken) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
};