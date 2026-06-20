import type { Locator, Page } from "@playwright/test";

export class Layout {
  private readonly page: Page;
  private readonly langSwitcher: { en: Locator; ru: Locator };
  private readonly themeSwitcher: { light: Locator; dark: Locator };
  private readonly header: Locator;
  private readonly html: Locator;

  constructor(page: Page) {
    this.page = page;
    this.langSwitcher = {
      en: page.getByTestId("lang-switcher__en"),
      ru: page.getByTestId("lang-switcher__ru"),
    };
    this.themeSwitcher = {
      light: page.getByTestId("theme-switcher__light"),
      dark: page.getByTestId("theme-switcher__dark"),
    };
    this.header = page.locator("h1");
    this.html = page.locator("html");
  }

  async switchLanguage(lang: "en" | "ru") {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: "load" }),
      (lang === "en" ? this.langSwitcher.en : this.langSwitcher.ru).click(),
    ]);
  }

  async switchTheme(theme: "light" | "dark") {
    await (
      theme === "light" ? this.themeSwitcher.light : this.themeSwitcher.dark
    ).click();
    await this.page.waitForFunction(
      (expected) => document.documentElement.dataset.theme === expected,
      theme,
    );
  }

  async getActiveLanguage(): Promise<"en" | "ru"> {
    return (await this.html.getAttribute("lang")) === "ru" ? "ru" : "en";
  }

  async getActiveTheme(): Promise<"dark" | "light"> {
    return (await this.html.getAttribute("data-theme")) === "dark"
      ? "dark"
      : "light";
  }

  async getHeaderText() {
    return await this.header.textContent();
  }
}
