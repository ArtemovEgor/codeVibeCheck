import { test as base } from "@playwright/test";
import { LandingPage } from "../pages/landing-page";
import { AuthPage } from "tests/pages/auth-page";
import { promises as fsPromises, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { PlaywrightAuthApi } from "tests/api/auth-api";
import { Layout } from "tests/pages/layout";
import { Dashboard } from "tests/pages/dashboard";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

dotenv.config({ path: path.resolve(dirname, "../.env") });

interface MyFixtures {
  layout: Layout;
  landingPage: LandingPage;
  authPage: AuthPage;
  authApi: PlaywrightAuthApi;
  dashboard: Dashboard;
}

export const test = base.extend<MyFixtures>({
  page: async ({ page }, use) => {
    await use(page);

    try {
      const coverage = await page.evaluate(() => globalThis.__coverage__);
      if (coverage) {
        const outputDirectory = path.join(process.cwd(), ".nyc_output");
        if (!existsSync(outputDirectory)) {
          await fsPromises.mkdir(outputDirectory, { recursive: true });
        }
        await fsPromises.writeFile(
          path.join(
            outputDirectory,
            `coverage-${Math.random().toString(36).slice(2, 11)}.json`,
          ),
          JSON.stringify(coverage),
        );
      }
    } catch (error) {
      console.warn(
        "Failed to extract coverage data:",
        error instanceof Error ? error.message : error,
      );
    }
  },
  layout: async ({ page }, use) => {
    await page.goto("/");
    const layout = new Layout(page);
    await use(layout);
  },
  landingPage: async ({ page }, use) => {
    const landingPage = new LandingPage(page);
    await page.goto("/");
    await use(landingPage);
  },
  authPage: async ({ landingPage }, use) => {
    const authPage = new AuthPage(landingPage.page);
    await landingPage.goToLogin();
    await use(authPage);
  },
  authApi: async ({ request }, use) => {
    const apiBaseUrl = process.env.VITE_API_URL || "http://localhost:5000";
    await use(new PlaywrightAuthApi(request, apiBaseUrl));
  },
  dashboard: async ({ authPage, authApi }, use) => {
    const dashboard = new Dashboard(authPage.page);
    const response = await authApi.register();
    const credentials = {
      email: response.auth.user.email,
      password: response.password,
    };

    await authPage.login(credentials);

    await use(dashboard);
  },
});

export { expect } from "@playwright/test";
