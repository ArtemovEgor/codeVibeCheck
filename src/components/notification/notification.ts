import "./notification.scss";
import { NotificationType } from "../../constants/notification";
import BaseComponent from "../base/base-component";

export default class Notification extends BaseComponent {
  private static container: HTMLElement | undefined = undefined;

  private static getContainer(): HTMLElement {
    if (this.container) return this.container;

    let container = document.querySelector(
      ".notifications-container",
    ) as HTMLElement;

    if (!container) {
      container = document.createElement("div");
      container.className = "notifications-container";
      document.body.append(container);
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

    const node = notification.getNode();

    setTimeout(() => {
      node.classList.add("notification--visible");
    }, 10);

    setTimeout(() => {
      node.classList.remove("notification--visible");

      setTimeout(() => {
        node.remove();
      }, 300);
    }, 5000);
  }
}
