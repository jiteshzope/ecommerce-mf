import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { SESSION_STORAGE_KEYS, type SessionState } from '@ecommerce-mf/session';
import {
  ProductApiService,
  type AddToCartApiResponse,
  type ProductApiItem,
  type ProductDetailsApiItem,
} from '../services/product-api.service';
import { ProductShellBridgeService } from '../services/product-shell-bridge.service';
import { PRODUCT_MESSAGES } from '../constants/product-constants';

interface ProductState {
  products: ProductApiItem[];
  selectedProduct: ProductDetailsApiItem | null;
  listLoading: boolean;
  detailsLoading: boolean;
  addToCartLoadingIds: string[];
  listError: string | null;
  detailsError: string | null;
  addToCartError: string | null;
  addToCartSuccess: string | null;
  empty: boolean;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  listLoading: false,
  detailsLoading: false,
  addToCartLoadingIds: [],
  listError: null,
  detailsError: null,
  addToCartError: null,
  addToCartSuccess: null,
  empty: true,
};

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(ProductApiService), bridge = inject(ProductShellBridgeService)) => {
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

    const readErrorCode = (error: unknown): string | null => {
      if (error instanceof HttpErrorResponse && error.error && typeof error.error === 'object') {
        const payload = error.error as { message?: unknown };
        return typeof payload.message === 'string' ? payload.message : null;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return null;
    };

    const loadProducts = async (): Promise<void> => {
        patchState(store, {
          listLoading: true,
          listError: null,
          addToCartError: null,
          addToCartSuccess: null,
        });

        try {
          const products = await firstValueFrom(api.getProducts());
          patchState(store, {
            products,
            listLoading: false,
            empty: products.length === 0,
          });
        } catch {
          patchState(store, {
            listLoading: false,
            listError: PRODUCT_MESSAGES.FAILED_TO_LOAD_LIST,
            products: [],
            empty: true,
          });
        }
    };

    const loadProductDetails = async (productId: string): Promise<void> => {
      patchState(store, {
        detailsLoading: true,
        detailsError: null,
        addToCartError: null,
        addToCartSuccess: null,
      });

      try {
        const selectedProduct = await firstValueFrom(api.getProductById(productId));
        patchState(store, {
          selectedProduct,
          detailsLoading: false,
        });
      } catch (error) {
        const errorCode = readErrorCode(error);
        patchState(store, {
          detailsLoading: false,
          selectedProduct: null,
          detailsError:
            errorCode === 'PRODUCT_NOT_FOUND'
              ? PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
              : PRODUCT_MESSAGES.FAILED_TO_LOAD_DETAILS,
        });
      }
    };

    const withAddToCartLoading = (productId: string, active: boolean): void => {
      const current = store.addToCartLoadingIds();
      const next = active
        ? [...new Set([...current, productId])]
        : current.filter((id) => id !== productId);
      patchState(store, { addToCartLoadingIds: next });
    };

    const addToCart = async (productId: string, quantity = 1): Promise<AddToCartApiResponse | null> => {
      patchState(store, {
        addToCartError: null,
        addToCartSuccess: null,
      });

      const accessToken = readAccessToken();
      if (!accessToken) {
        patchState(store, { addToCartError: PRODUCT_MESSAGES.LOGIN_REQUIRED });
        return null;
      }

      withAddToCartLoading(productId, true);

      try {
        const response = await firstValueFrom(
          api.addToCart(accessToken, {
            productId,
            quantity,
          }),
        );
        patchState(store, {
          addToCartSuccess: PRODUCT_MESSAGES.ADDED_TO_CART,
        });
        return response;
      } catch {
        patchState(store, {
          addToCartError: PRODUCT_MESSAGES.FAILED_TO_ADD_TO_CART,
        });
        return null;
      } finally {
        withAddToCartLoading(productId, false);
      }
    };

    return {
      loadProducts,
      loadProductDetails,
      addToCart,

      isAddToCartLoading(productId: string): boolean {
        return store.addToCartLoadingIds().includes(productId);
      },

      initialize(): void {
        bridge.publishRemoteReady();
      },

      clearListError(): void {
        patchState(store, { listError: null });
      },

      clearDetailsError(): void {
        patchState(store, { detailsError: null });
      },

      clearAddToCartMessage(): void {
        patchState(store, {
          addToCartError: null,
          addToCartSuccess: null,
        });
      },

      clearSelectedProduct(): void {
        patchState(store, {
          selectedProduct: null,
          detailsError: null,
        });
      },
    };
  }),
);
