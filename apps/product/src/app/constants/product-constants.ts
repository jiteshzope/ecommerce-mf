/**
 * Product app constants
 */

export const PRODUCT_APP_LABELS = {
  TITLE: 'Discover Products',
  SUBTITLE: 'Curated everyday essentials from the latest catalog.',
  REFRESH_BUTTON: 'Refresh Catalog',
  LIST_LOADING: 'Loading products...',
  DETAIL_LOADING: 'Loading product details...',
  NO_DATA: 'No products found right now.',
  BACK_TO_LIST: 'Back to products',
  VIEW_DETAILS: 'View details',
  ADD_TO_CART: 'Add to cart',
  ADDING_TO_CART: 'Adding...',
  EMPTY_CART_HINT: 'Sign in from the auth app to add items to cart.',
} as const;

export const PRODUCT_MESSAGES = {
  FAILED_TO_LOAD_LIST: 'Failed to load products. Please try again.',
  FAILED_TO_LOAD_DETAILS: 'Failed to load product details. Please try again.',
  FAILED_TO_ADD_TO_CART: 'Unable to add item to cart. Please try again.',
  FAILED_TO_REMOVE_FROM_CART: 'Unable to remove item from cart. Please try again.',
  PRODUCT_NOT_FOUND: 'Product not found.',
  REMOTE_READY: 'Product remote is ready',
} as const;
