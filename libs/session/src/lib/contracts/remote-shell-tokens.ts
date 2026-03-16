import { InjectionToken } from '@angular/core';
import type { RemoteShellChannel } from './remote-shell-channel';
import type {
  AuthShellEvent,
  CartShellEvent,
  ProductShellEvent,
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
