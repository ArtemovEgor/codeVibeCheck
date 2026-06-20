import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(dirname, ".env") });

import fs from "node:fs";
const nycOutputDirectory = path.resolve(dirname, ".nyc_output");
if (fs.existsSync(nycOutputDirectory)) {
  for (const file of fs.readdirSync(nycOutputDirectory)) {
    try {
      fs.unlinkSync(path.join(nycOutputDirectory, file));
    } catch (error) {
      console.warn(
        "Failed to unlink a nyc file:",
        error instanceof Error ? error.message : error,
      );
    }
  }
} else {
  fs.mkdirSync(nycOutputDirectory, { recursive: true });
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:3000/codeVibeCheck/",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: "npm run dev",
      cwd: "./backend",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: "3001",
      },
    },
    {
      command: "npm run dev",
      url: "http://localhost:3000/codeVibeCheck/",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
