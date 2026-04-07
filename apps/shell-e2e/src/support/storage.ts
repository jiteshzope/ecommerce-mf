import type { Page } from '@playwright/test';

const SESSION_STORAGE_KEYS = ['ecommerce-mf.auth.session', 'ecommerce-mf.shell.auth.session'] as const;

export async function clearBrowserState(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto('/');
  await page.evaluate((keys: readonly string[]) => {
    for (const key of keys) {
      localStorage.removeItem(key);
    }

    sessionStorage.clear();
  }, SESSION_STORAGE_KEYS);
}