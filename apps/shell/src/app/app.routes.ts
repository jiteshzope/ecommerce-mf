import { Route } from '@angular/router';
import { cartAuthGuard } from './guards/cart-auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () => import('auth/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'cart',
    canMatch: [cartAuthGuard],
    loadChildren: () => import('cart/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'product',
    loadChildren: () => import('product/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'product',
  },
];
