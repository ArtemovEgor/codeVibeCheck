import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class Dashboard extends BasePage {
  private readonly logoutButton: Locator;
  private readonly burger: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutButton = page.getByTestId("logout-button");
    this.burger = page.getByTestId("burger-button");
  }

  async logout() {
    if (await this.burger.isVisible()) {
      await this.burger.click();
    }
    await this.logoutButton.click();
  }
}
