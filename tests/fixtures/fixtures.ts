import { test as base } from "@playwright/test";
import { LandingPage } from "../pages/landing-page";
import { promises as fsPromises, existsSync } from "node:fs";
import path from "node:path";

interface MyFixtures {
  landingPage: LandingPage;
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
  landingPage: async ({ page }, use) => {
    const landingPage = new LandingPage(page);
    await page.goto("/");
    await use(landingPage);
  },
});

export { expect } from "@playwright/test";
