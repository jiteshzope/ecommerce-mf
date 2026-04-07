import { appRoutes } from './app.routes';
import { cartAuthGuard } from './guards/cart-auth.guard';

describe('appRoutes', () => {
  it('defines the expected micro-frontend routes', () => {
    expect(appRoutes).toHaveLength(4);
    expect(appRoutes.map((route) => route.path)).toEqual(['auth', 'cart', 'product', '']);
  });

  it('protects the cart route and redirects the empty path to product', () => {
    const cartRoute = appRoutes.find((route) => route.path === 'cart');
    const defaultRoute = appRoutes.find((route) => route.path === '');

    expect(cartRoute?.canMatch).toEqual([cartAuthGuard]);
    expect(defaultRoute).toMatchObject({
      pathMatch: 'full',
      redirectTo: 'product',
    });
  });
});