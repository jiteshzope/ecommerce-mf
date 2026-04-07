import { test } from '@playwright/test';
import appContent from './fixtures/app-content.json';
import { AuthPage } from './page-objects/auth.page';
import { CartPage } from './page-objects/cart.page';
import { ProductPage } from './page-objects/product.page';
import { ShellHeaderPage } from './page-objects/shell-header.page';
import { clearBrowserState } from './support/storage';
import { buildTestUser } from './support/test-user';

test.describe('post-deploy shopping flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('lets a shopper add products from the catalog and product details pages', async ({ page }) => {
    const authPage = new AuthPage(page);
    const cartPage = new CartPage(page);
    const productPage = new ProductPage(page);
    const shellHeader = new ShellHeaderPage(page);
    const user = buildTestUser('shopping');

    await test.step('register and land on the catalog', async () => {
      await authPage.gotoRegister('/product');
      await authPage.register(user);

      await productPage.expectLoaded();
      await shellHeader.expectSignedIn(user.email);
    });

    await test.step('add a seeded product from the catalog grid', async () => {
      await productPage.addFromList(appContent.products.catalogListTitle);
      await shellHeader.expectCartCount(1);
    });

    await test.step('add a second seeded product from its details page', async () => {
      await productPage.openDetails(appContent.products.detailsPageTitle);
      await productPage.addFromDetails(1);
      await shellHeader.expectCartCount(2);
    });

    await test.step('verify the cart contents and quantity changes', async () => {
      await shellHeader.openCart();

      await cartPage.expectLoaded();
      await cartPage.expectItemQuantity(appContent.products.catalogListTitle, 1);
      await cartPage.expectItemQuantity(appContent.products.detailsPageTitle, 1);
      await cartPage.increaseItem(appContent.products.catalogListTitle, 2);
    });
  });
});