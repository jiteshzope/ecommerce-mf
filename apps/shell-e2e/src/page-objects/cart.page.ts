import { expect, type Locator, type Page } from '@playwright/test';
import appContent from '../fixtures/app-content.json';

export class CartPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/cart(?:\?|$)/);
    await expect(this.page.getByTestId('cart-page')).toBeVisible();
    await expect(this.page.getByRole('heading', { level: 2, name: appContent.cartHeading })).toBeVisible();
  }

  itemRow(title: string): Locator {
    return this.page
      .locator('[data-testid^="cart-item-"]')
      .filter({ has: this.page.locator('[data-testid^="cart-item-title-"]', { hasText: title }) });
  }

  async expectItemQuantity(title: string, quantity: number): Promise<void> {
    const row = this.itemRow(title);

    await expect(row).toBeVisible();
    await expect(row.locator('.item-quantity')).toHaveText(String(quantity));
  }

  async increaseItem(title: string, expectedQuantity: number): Promise<void> {
    const row = this.itemRow(title);

    await row.getByRole('button', { name: 'Increase quantity' }).click();
    await expect(row.locator('.item-quantity')).toHaveText(String(expectedQuantity));
  }
}