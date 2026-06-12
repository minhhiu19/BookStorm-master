const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test/e2e',
  outputDir: './test/test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: './test/playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1920, height: 1200 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
