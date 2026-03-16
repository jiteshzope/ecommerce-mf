import { InjectionToken } from '@angular/core';
import type { RemoteShellChannel } from './remote-shell-channel';
import type {
  AuthShellEvent,
  CartShellEvent,
  ProductShellEvent,
  ShellAuthEvent,
  ShellCartEvent,
  ShellProductEvent,
} from './remote-shell-events';

export const AUTH_SHELL_CHANNEL = new InjectionToken<
  RemoteShellChannel<AuthShellEvent>
>('AUTH_SHELL_CHANNEL');

export const CART_SHELL_CHANNEL = new InjectionToken<
  RemoteShellChannel<CartShellEvent>
>('CART_SHELL_CHANNEL');

export const PRODUCT_SHELL_CHANNEL = new InjectionToken<
  RemoteShellChannel<ProductShellEvent>
>('PRODUCT_SHELL_CHANNEL');

// Shell -> Remote direction tokens
export const SHELL_AUTH_CHANNEL = new InjectionToken<
  RemoteShellChannel<ShellAuthEvent>
>('SHELL_AUTH_CHANNEL');

export const SHELL_CART_CHANNEL = new InjectionToken<
  RemoteShellChannel<ShellCartEvent>
>('SHELL_CART_CHANNEL');

export const SHELL_PRODUCT_CHANNEL = new InjectionToken<
  RemoteShellChannel<ShellProductEvent>
>('SHELL_PRODUCT_CHANNEL');
