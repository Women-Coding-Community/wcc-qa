import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_HOST,
      },
    },

    {
      name: 'admin.setup',
      testDir: './tests/admin',
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ADMIN_URL,
      },
    },
    {
      name: 'admin',
      testDir: './tests/admin',
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ADMIN_URL,
      },
      dependencies: ['admin.setup'],
    },

    {
      name: 'website',
      testDir: './tests/website',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEBSITE_URL ?? 'https://mentorship.womencodingcommunity.com',
      },
    },
  ],
});
