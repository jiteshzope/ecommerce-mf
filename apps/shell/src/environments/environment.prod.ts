const localApiBaseUrl = 'http://localhost:3000/api/v1';
const browserHost = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalHost = browserHost === 'localhost' || browserHost === '127.0.0.1';

export const environment = {
  production: true,
  ecommerceApiBaseUrl:
    typeof window !== 'undefined' && !isLocalHost ? `${window.location.origin}/api/v1` : localApiBaseUrl,
} as const;
