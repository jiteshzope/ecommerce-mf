/**
 * Shell app constants
 */

export const SHELL_APP_LABELS = {
  TITLE: 'Shell Dashboard',
  REFRESH_BUTTON: 'Refresh Shell Data',
  AUTH_EVENT_BUTTON: 'Send Auth Event',
  CART_EVENT_BUTTON: 'Send Cart Event',
  PRODUCT_EVENT_BUTTON: 'Send Product Event',
  LOADING: 'Loading shell data...',
  NO_DATA: 'No shell data found.',
} as const;

export const SHELL_MESSAGES = {
  FAILED_TO_LOAD: 'Failed to load shell dashboard data.',
} as const;
