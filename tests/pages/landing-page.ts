import { expect, Locator, Page } from "@playwright/test";

export class LandingPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly langSwitcher: { en: Locator; ru: Locator };
  readonly themeSwitcher: { light: Locator; dark: Locator };
  readonly heroCTA: Locator;
  readonly footerCTA: Locator;
  readonly modalOverlay: Locator;
  readonly html: Locator;
  readonly header: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByTestId("header-login-btn");
    this.registerButton = page.getByTestId("header-register-btn");
    this.langSwitcher = {
      en: page.getByTestId("lang-switcher__en"),
      ru: page.getByTestId("lang-switcher__ru"),
    };
    this.themeSwitcher = {
      light: page.getByTestId("theme-switcher__light"),
      dark: page.getByTestId("theme-switcher__dark"),
    };
    this.heroCTA = page.locator(".hero").getByTestId("landing-cta-btn");
    this.footerCTA = page.locator(".cta").getByTestId("landing-cta-btn");
    this.modalOverlay = page.getByTestId("modal-overlay");
    this.html = page.locator("html");
    this.header = page.locator("h1");
  }

  async goToLogin() {
    await this.loginButton.click();
  }

  async goToRegister() {
    await this.registerButton.click();
  }

  private async verifyCTAUrls() {
    await expect(this.page).toHaveURL(/\/register$/);
    await expect(this.modalOverlay).toBeVisible();

    await this.clickModalOverlay();
    await expect(this.modalOverlay).toBeHidden();
    await expect(this.page).toHaveURL(/#\//);
  }

  async verifyHeroCTA() {
    await this.heroCTA.click();
    await this.verifyCTAUrls();
  }

  async verifyFooterCTA() {
    await this.footerCTA.click();
    await this.verifyCTAUrls();
  }

  async clickModalOverlay() {
    const height = this.page.viewportSize()?.height ?? 800;
    await this.page.mouse.click(50, height - 50);
  }

  async switchLanguageAndVerify(lang: "ru" | "en") {
    await this.langSwitcher[lang].click();

    if (lang === "en") {
      await expect(this.header).toHaveText(/^[^а-яА-ЯёЁ]*$/);
      await expect(this.header).toHaveText(/[a-zA-Z]/);
    } else {
      await expect(this.header).toHaveText(/[а-яА-ЯёЁ]/);
    }
  }

  async switchThemeAndVerify(theme: "light" | "dark") {
    await this.themeSwitcher[theme].click();
    await expect(this.html).toHaveAttribute("data-theme", theme);
  }
}
