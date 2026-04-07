import { expect, type Page } from '@playwright/test';

export class ShellHeaderPage {
  constructor(private readonly page: Page) {}

  async expectLoggedOut(): Promise<void> {
    await expect(this.page.getByTestId('shell-header')).toBeVisible();
    await expect(this.page.getByTestId('login-button')).toBeVisible();
    await expect(this.page.getByTestId('register-button')).toBeVisible();
  }

  async expectSignedIn(email: string): Promise<void> {
    await expect(this.page.getByTestId('signed-in-user')).toContainText(email);
    await expect(this.page.getByTestId('logout-button')).toBeVisible();
  }

  async expectCartCount(count: number): Promise<void> {
    await expect(this.page.getByTestId('cart-badge')).toHaveText(String(count));
  }

  async openCart(): Promise<void> {
    await this.page.getByTestId('cart-link').click();
  }

  async logout(): Promise<void> {
    await this.page.getByTestId('logout-button').click();
  }
}