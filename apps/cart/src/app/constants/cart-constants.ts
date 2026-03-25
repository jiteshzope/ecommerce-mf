/**
 * Cart app constants
 */

export const CART_APP_LABELS = {
  TITLE: 'Cart Remote',
  REFRESH_BUTTON: 'Refresh Cart Data',
  LOADING: 'Loading cart data...',
  NO_DATA: 'No cart data found.',
} as const;

export const CART_MESSAGES = {
  FAILED_TO_LOAD: 'Failed to load cart data.',
  FAILED_TO_INCREASE_QUANTITY: 'Failed to increase cart item quantity.',
  FAILED_TO_DECREASE_QUANTITY: 'Failed to decrease cart item quantity.',
  REMOTE_READY: 'Cart remote is ready',
} as const;
