import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';
const isCI = process.env['CI'] === 'true';
const useDeployedApp = Boolean(process.env['BASE_URL']);

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  outputDir: '../../dist/.playwright/apps/shell-e2e/test-results',
  reporter: isCI
    ? [
        ['github'],
        ['blob', { outputDir: '../../dist/.playwright/apps/shell-e2e/blob-report' }],
        ['html', { open: 'never', outputFolder: '../../dist/.playwright/apps/shell-e2e/html-report' }],
      ]
    : [['list'], ['html', { open: 'never', outputFolder: '../../dist/.playwright/apps/shell-e2e/html-report' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    headless: isCI,
    testIdAttribute: 'data-testid',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  /* Run your local dev server before starting the tests */
  webServer: useDeployedApp
    ? undefined
    : {
        command: 'npx nx run shell:serve',
        url: 'http://localhost:4200',
        reuseExistingServer: !isCI,
        cwd: workspaceRoot,
        timeout: 120 * 1000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
