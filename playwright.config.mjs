import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: 'test-results',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium-mv3',
      testMatch: ['extension.spec.mjs', 'live.spec.mjs'],
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox-mv2-bridge',
      testMatch: 'translation-bridge.spec.mjs',
      use: { ...devices['Desktop Firefox'] }
    }
  ]
});
