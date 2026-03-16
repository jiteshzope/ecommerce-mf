import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  AUTH_SHELL_CHANNEL,
  CART_SHELL_CHANNEL,
  PRODUCT_SHELL_CHANNEL,
  SHELL_AUTH_CHANNEL,
  SHELL_CART_CHANNEL,
  SHELL_PRODUCT_CHANNEL,
  type AuthShellEvent,
  type CartShellEvent,
  type ProductShellEvent,
  type ShellAuthEvent,
  type ShellCartEvent,
  type ShellProductEvent,
} from '@ecommerce-mf/session';
import { appRoutes } from './app.routes';
import { ShellRemoteChannelService } from './services/shell-remote-channel.service';

// Remote -> Shell channels (remotes publish, shell subscribes)
const authShellChannel = new ShellRemoteChannelService<AuthShellEvent>();
const cartShellChannel = new ShellRemoteChannelService<CartShellEvent>();
const productShellChannel = new ShellRemoteChannelService<ProductShellEvent>();

// Shell -> Remote channels (shell publishes, remotes subscribe)
const shellAuthChannel = new ShellRemoteChannelService<ShellAuthEvent>();
const shellCartChannel = new ShellRemoteChannelService<ShellCartEvent>();
const shellProductChannel = new ShellRemoteChannelService<ShellProductEvent>();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    { provide: AUTH_SHELL_CHANNEL, useValue: authShellChannel },
    { provide: CART_SHELL_CHANNEL, useValue: cartShellChannel },
    { provide: PRODUCT_SHELL_CHANNEL, useValue: productShellChannel },
    { provide: SHELL_AUTH_CHANNEL, useValue: shellAuthChannel },
    { provide: SHELL_CART_CHANNEL, useValue: shellCartChannel },
    { provide: SHELL_PRODUCT_CHANNEL, useValue: shellProductChannel },
  ],
};
