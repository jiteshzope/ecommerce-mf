/**
 * Auth app constants
 */

export const AUTH_APP_LABELS = {
  TITLE: 'Authentication',
  LOGIN_TITLE: 'Sign in',
  REGISTER_TITLE: 'Create account',
} as const;

export const AUTH_MESSAGES = {
  REMOTE_READY: 'Auth remote is ready',
  INVALID_LOGIN: 'Invalid email or password.',
  EMAIL_IN_USE: 'An account with this email already exists.',
  REGISTER_FAILED: 'Unable to register at the moment. Please try again.',
  SESSION_RESTORED: 'Session restored from browser storage.',
} as const;


