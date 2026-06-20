import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class LandingPage extends BasePage {
  private readonly loginButton: Locator;
  private readonly registerButton: Locator;
  private readonly heroCTA: Locator;
  private readonly footerCTA: Locator;
  private readonly modalOverlay: Locator;

  constructor(page: Page) {
    super(page);
    this.loginButton = page.getByTestId("header-login-btn");
    this.registerButton = page.getByTestId("header-register-btn");
    this.heroCTA = page.locator(".hero").getByTestId("landing-cta-btn");
    this.footerCTA = page.locator(".cta").getByTestId("landing-cta-btn");
    this.modalOverlay = page.getByTestId("modal-overlay");
  }

  async goToLogin() {
    await this.loginButton.click();
  }

  async goToRegister() {
    await this.registerButton.click();
  }

  async verifyLoginOpen() {
    await expect(this.page).toHaveURL(/\/login$/);
    await expect(this.modalOverlay).toBeVisible();
  }

  async verifyRegistrationOpen() {
    await expect(this.page).toHaveURL(/\/register$/);
    await expect(this.modalOverlay).toBeVisible();
  }

  async verifyModalClose() {
    await expect(this.modalOverlay).toBeHidden();
    await expect(this.page).toHaveURL(/#\//);
  }

  async clickModalOverlay() {
    const height = this.page.viewportSize()?.height ?? 800;
    await this.page.mouse.click(50, height - 50);
  }

  async clickHeroCTA() {
    await this.heroCTA.click();
  }

  async clickFooterCTA() {
    await this.footerCTA.click();
  }
}
