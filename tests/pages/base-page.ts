import type { Page } from "@playwright/test";
import { Notification } from "tests/components/notification";

export class BasePage {
  public page: Page;
  public notification: Notification;

  constructor(page: Page) {
    this.page = page;
    this.notification = new Notification(page);
  }
}
