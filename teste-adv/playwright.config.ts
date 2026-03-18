import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Configuração E2E com Playwright
 * @see https://playwright.dev/docs/test-configuration
 *
 * Pré-requisitos:
 * - PostgreSQL e Redis rodando (para teste-api)
 * - Database migrado e seed executado (admin@example.com / password123)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium-authenticated',
      testMatch: /(dashboard|transactions)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'chromium-guest',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      name: 'Next.js',
      timeout: 60_000,
      reuseExistingServer: process.env.CI !== 'true',
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL:
          process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
      },
    },
    {
      command: 'pnpm start:dev',
      url: 'http://localhost:3001/v1/health',
      name: 'NestJS API',
      cwd: path.resolve(__dirname, '../teste-api'),
      timeout: 90_000,
      reuseExistingServer: process.env.CI !== 'true',
    },
  ],
});
