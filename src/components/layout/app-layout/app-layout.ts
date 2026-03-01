import BaseComponent from "@/components/base/base-component";
import { Sidebar } from "../sidebar/sidebar";
import "./app-layout.scss";

export class AppLayout extends BaseComponent {
  private contentArea: BaseComponent;
  private sidebar: Sidebar;
  private overlay: BaseComponent;
  private burger!: BaseComponent;

  constructor() {
    super({ tag: "div", className: "app-layout" });

    this.sidebar = new Sidebar();

    this.contentArea = new BaseComponent({
      tag: "main",
      className: "app-layout__content",
    });

    this.overlay = new BaseComponent({ className: "sidebar-overlay" });

    this.addChildren([
      this.createMobileHeader(),
      this.sidebar,
      this.overlay,
      this.contentArea,
    ]);

    this.initEvents();
  }

  private initEvents() {
    this.sidebar.onNavLinkClick(() => this.closeSidebar());

    this.burger.on("click", () => {
      const isOpen = this.sidebar.getNode().classList.contains("sidebar--open");
      this.sidebar.toggleClass("sidebar--open", !isOpen);
      this.overlay.toggleClass("sidebar-overlay--visible", !isOpen);
      this.burger.toggleClass("burger--active", !isOpen);
    });

    this.overlay.on("click", () => this.closeSidebar());
  }

  private createMobileHeader(): BaseComponent {
    const bar = new BaseComponent({ className: "mobile-bar" });

    new BaseComponent({
      tag: "span",
      className: "logo__icon",
      text: "</>",
      parent: bar,
    });

    this.burger = new BaseComponent({
      tag: "button",
      className: "burger",
      parent: bar,
      children: [
        new BaseComponent({ tag: "span", className: "burger-line" }),
        new BaseComponent({ tag: "span", className: "burger-line" }),
        new BaseComponent({ tag: "span", className: "burger-line" }),
      ],
    });

    return bar;
  }

  private closeSidebar(): void {
    this.sidebar.toggleClass("sidebar--open", false);
    this.overlay.toggleClass("sidebar-overlay--visible", false);
    this.burger.toggleClass("burger--active", false);
  }

  public setPage(page: BaseComponent): void {
    this.contentArea.getNode().replaceChildren(page.getNode());
  }
}
