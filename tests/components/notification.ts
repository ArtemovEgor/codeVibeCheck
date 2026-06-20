import type { Page } from "@playwright/test";
import { expect } from "../fixtures/fixtures";
import { NotificationType } from "@/constants/notification";

export class Notification {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectError(message: string) {
    const errorNotifications = this.page.locator(
      `[data-testid="notification"][data-type="${NotificationType.ERROR}"]`,
    );
    await expect(errorNotifications.last()).toHaveText(message);
  }

  async expectSuccess(message: string) {
    const successNotifications = this.page.locator(
      `[data-testid="notification"][data-type="${NotificationType.SUCCESS}"]`,
    );
    await expect(successNotifications.last()).toHaveText(message);
  }
}
