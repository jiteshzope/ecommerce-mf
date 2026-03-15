import { NxWelcome } from './nx-welcome';
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () => import('auth/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'cart',
    loadChildren: () => import('cart/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'product',
    loadChildren: () => import('product/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: '',
    component: NxWelcome,
  },
];
