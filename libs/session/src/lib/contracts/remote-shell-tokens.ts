import { InjectionToken } from '@angular/core';
import type { RemoteShellChannel } from './remote-shell-channel';
import type {
  AuthChannelEvent,
  CartChannelEvent,
  ProductChannelEvent,
} from './remote-shell-events';

export const AUTH_SHELL_CHANNEL = new InjectionToken<
  RemoteShellChannel<AuthChannelEvent>
>('AUTH_SHELL_CHANNEL');

export const CART_SHELL_CHANNEL = new InjectionToken<
  RemoteShellChannel<CartChannelEvent>
>('CART_SHELL_CHANNEL');

export const PRODUCT_SHELL_CHANNEL = new InjectionToken<
  RemoteShellChannel<ProductChannelEvent>
>('PRODUCT_SHELL_CHANNEL');
