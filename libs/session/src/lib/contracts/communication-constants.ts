/**
 * Remote sources
 */
export const REMOTE_SOURCES = {
  AUTH: 'auth',
  CART: 'cart',
  PRODUCT: 'product',
  SHELL: 'shell',
} as const;

/**
 * Auth remote ← → Shell event types
 */
export const AUTH_EVENT_TYPES = {
  // Remote → Shell
  REMOTE_READY: 'remote-ready',
  LOGIN_SUCCESS: 'login-success',
  LOGIN_FAILED: 'login-failed',
  LOGOUT: 'logout',
  REGISTER_SUCCESS: 'register-success',

  // Shell → Remote
  NAVIGATE_TO_LOGIN: 'navigate-to-login',
  NAVIGATE_TO_REGISTER: 'navigate-to-register',
  SESSION_EXPIRED: 'session-expired',
  LOGOUT_REQUESTED: 'logout-requested',
} as const;

/**
 * Cart remote ← → Shell event types
 */
export const CART_EVENT_TYPES = {
  // Remote → Shell
  REMOTE_READY: 'remote-ready',
  CART_UPDATED: 'cart-updated',
  CHECKOUT_INITIATED: 'checkout-initiated',
  CART_CLEARED: 'cart-cleared',

  // Shell → Remote
  ADD_ITEM: 'add-item',
  REMOVE_ITEM: 'remove-item',
  CLEAR_CART: 'clear-cart',
  SYNC_CART: 'sync-cart',
} as const;

/**
 * Product remote ← → Shell event types
 */
export const PRODUCT_EVENT_TYPES = {
  // Remote → Shell
  REMOTE_READY: 'remote-ready',
  PRODUCT_SELECTED: 'product-selected',
  PRODUCT_VIEWED: 'product-viewed',
  ADD_TO_CART_REQUESTED: 'add-to-cart-requested',

  // Shell → Remote
  LOAD_PRODUCT: 'load-product',
  CLEAR_SELECTION: 'clear-selection',
  FILTER_BY_CATEGORY: 'filter-by-category',
} as const;
