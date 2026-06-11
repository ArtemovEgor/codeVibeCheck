import { test } from "./fixtures/fixtures";

test.describe("layout", () => {
  test("language switching", async ({ landingPage }) => {
    await landingPage.switchLanguageAndVerify("en");
    await landingPage.switchLanguageAndVerify("ru");
    await landingPage.switchLanguageAndVerify("en");
  });

  test("theme switching", async ({ landingPage }) => {
    await landingPage.switchThemeAndVerify("dark");
    await landingPage.switchThemeAndVerify("light");
    await landingPage.switchThemeAndVerify("dark");
  });
});
