import "./notification.scss";
import { NotificationType } from "../../constants/notification";
import BaseComponent from "../base/base-component";

export default class Notification extends BaseComponent {
  private static container: HTMLElement;

  private static getContainer(): HTMLElement {
    if (this.container && this.container.isConnected) return this.container;

    let container = document.querySelector(
      ".notifications-container",
    ) as HTMLElement;

    if (!container) {
      container = new BaseComponent({
        tag: "div",
        className: "notifications-container",
        parent: document.body,
        attributes: {
          popover: "manual",
        },
      }).getNode();
      container.showPopover();
    }

    this.container = container;
    return container;
  }

  public static show(message: string, type = NotificationType.SUCCESS): void {
    const container = this.getContainer();
    const notification = new BaseComponent({
      tag: "div",
      className: `notification notification-${type}`,
      text: message,
      parent: container,
    });

    container.hidePopover();
    container.showPopover();

    const node = notification.getNode();

    setTimeout(() => {
      node.classList.add("notification--visible");
    }, 10);

    setTimeout(() => {
      node.classList.remove("notification--visible");

      setTimeout(() => {
        notification.destroy();
      }, 300);
    }, 5000);
  }
}
