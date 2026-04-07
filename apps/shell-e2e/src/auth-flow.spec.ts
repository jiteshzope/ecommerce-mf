import { expect, test } from '@playwright/test';
import { AuthPage } from './page-objects/auth.page';
import { CartPage } from './page-objects/cart.page';
import { ProductPage } from './page-objects/product.page';
import { ShellHeaderPage } from './page-objects/shell-header.page';
import { clearBrowserState } from './support/storage';
import { buildTestUser } from './support/test-user';

test.describe('post-deploy auth coverage', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('redirects unauthenticated cart visits to product and supports register/logout', async ({ page }) => {
    const authPage = new AuthPage(page);
    const cartPage = new CartPage(page);
    const productPage = new ProductPage(page);
    const shellHeader = new ShellHeaderPage(page);
    const user = buildTestUser('auth');

    await test.step('redirect unauthenticated cart access to the product route', async () => {
      await page.goto('/cart');

      await productPage.expectLoaded();
      await shellHeader.expectLoggedOut();
    });

    await test.step('register a new shopper and open the protected cart page', async () => {
      await authPage.gotoRegister('/cart');
      await authPage.register(user);

      await shellHeader.expectSignedIn(user.email);
      await page.goto('/cart');
      await cartPage.expectLoaded();
    });

    await test.step('log out and return to the product catalog', async () => {
      await shellHeader.logout();

      await productPage.expectLoaded();
      await shellHeader.expectLoggedOut();
    });
  });
});