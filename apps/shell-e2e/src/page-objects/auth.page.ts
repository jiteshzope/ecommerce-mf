import { expect, type Page } from '@playwright/test';
import appContent from '../fixtures/app-content.json';
import type { TestUser } from '../support/test-user';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async gotoLogin(returnUrl?: string): Promise<void> {
    const suffix = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
    await this.page.goto(`/auth/login${suffix}`);
    await this.expectLoginPage();
  }

  async gotoRegister(returnUrl?: string): Promise<void> {
    const suffix = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
    await this.page.goto(`/auth/register${suffix}`);
    await this.expectRegisterPage();
  }

  async expectLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/login(?:\?|$)/);
    await expect(this.page.getByRole('heading', { level: 2, name: appContent.loginHeading })).toBeVisible();
    await expect(this.page.getByTestId('login-form')).toBeVisible();
  }

  async expectRegisterPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/register(?:\?|$)/);
    await expect(this.page.getByRole('heading', { level: 2, name: appContent.registerHeading })).toBeVisible();
    await expect(this.page.getByTestId('register-form')).toBeVisible();
  }

  async login(user: Pick<TestUser, 'email' | 'password'>): Promise<void> {
    await this.page.getByLabel('Email').fill(user.email);
    await this.page.getByLabel('Password').fill(user.password);
    await this.page.getByTestId('login-submit').click();
  }

  async register(user: TestUser): Promise<void> {
    await this.page.getByLabel('Full name').fill(user.name);
    await this.page.getByLabel('Email').fill(user.email);
    await this.page.getByLabel('Phone number').fill(user.phoneNumber);
    await this.page.getByLabel('Password', { exact: true }).fill(user.password);
    await this.page.getByLabel('Confirm password').fill(user.confirmPassword);
    await this.page.getByTestId('register-submit').click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.page.getByRole('alert')).toContainText(message);
  }
}