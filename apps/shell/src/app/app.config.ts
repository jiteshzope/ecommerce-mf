import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  AUTH_SHELL_CHANNEL,
  CART_SHELL_CHANNEL,
  PRODUCT_SHELL_CHANNEL,
  type AuthShellEvent,
  type CartShellEvent,
  type ProductShellEvent,
} from '@ecommerce-mf/session';
import { appRoutes } from './app.routes';
import { ShellRemoteChannelService } from './services/shell-remote-channel.service';

const authShellChannel = new ShellRemoteChannelService<AuthShellEvent>();
const cartShellChannel = new ShellRemoteChannelService<CartShellEvent>();
const productShellChannel = new ShellRemoteChannelService<ProductShellEvent>();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    { provide: AUTH_SHELL_CHANNEL, useValue: authShellChannel },
    { provide: CART_SHELL_CHANNEL, useValue: cartShellChannel },
    { provide: PRODUCT_SHELL_CHANNEL, useValue: productShellChannel },
  ],
};
