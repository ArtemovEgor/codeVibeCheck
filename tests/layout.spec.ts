import { test, expect } from "./fixtures/fixtures";

test.describe("layout", () => {
  test("language switching", async ({ layout }) => {
    await layout.switchLanguage("en");
    await expect(await layout.getActiveLanguage()).toBe("en");
    await expect(await layout.getHeaderText()).toMatch(/^[^а-яА-ЯёЁ]*$/);
    await expect(await layout.getHeaderText()).toMatch(/[a-zA-Z]/);

    await layout.switchLanguage("ru");
    await expect(await layout.getActiveLanguage()).toBe("ru");
    await expect(await layout.getHeaderText()).toMatch(/[а-яА-ЯёЁ]/);

    await layout.switchLanguage("en");
    await expect(await layout.getActiveLanguage()).toBe("en");
    await expect(await layout.getHeaderText()).toMatch(/^[^а-яА-ЯёЁ]*$/);
    await expect(await layout.getHeaderText()).toMatch(/[a-zA-Z]/);
  });

  test("theme switching", async ({ layout }) => {
    await layout.switchTheme("dark");
    await expect(await layout.getActiveTheme()).toBe("dark");
    await layout.switchTheme("light");
    await expect(await layout.getActiveTheme()).toBe("light");
    await layout.switchTheme("dark");
    await expect(await layout.getActiveTheme()).toBe("dark");
  });
});
