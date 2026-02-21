import { EN } from "@/locale/en";
import BaseComponent from "../../base/base-component";
import Link from "../../link/link";
import { ThemeSwitcher } from "../theme-switcher/theme-switcher";
import "./header.scss";

export class Header extends BaseComponent {
  constructor() {
    super({ tag: "header", className: "header" });
    this.restoreTheme();
    this.render();
    this.initScrollHandler();
  }

  private restoreTheme(): void {
    const saved = localStorage.getItem("app-theme") ?? "dark";
    document.documentElement.dataset.theme = saved;
  }

  private render(): void {
    const container = new BaseComponent({
      className: "container header__container",
      parent: this,
    });

    const logoLink = new Link({
      href: "#",
      className: "logo",
      parent: container,
    });

    new BaseComponent({
      tag: "span",
      className: "logo__icon",
      text: "</>",
      parent: logoLink,
    });

    new BaseComponent({
      tag: "span",
      className: "logo__text",
      text: "codeVibeCheck",
      parent: logoLink,
    });

    const right = new BaseComponent({
      className: "header__right",
      parent: container,
    });

    this.createThemeSwitcher(right);
    this.createActions(right);
  }

  private createThemeSwitcher(parent: BaseComponent): void {
    parent.addChildren([new ThemeSwitcher()]);
  }

  private createActions(parent: BaseComponent): void {
    const actions = new BaseComponent({
      className: "header__actions",
      parent,
    });

    new Link({
      text: EN.common.auth.login,
      href: "#login",
      variant: "ghost",
      parent: actions,
    });
    new Link({
      text: EN.common.auth.signup,
      href: "#register",
      variant: "primary",
      parent: actions,
    });
  }

  private scrollHandler = (): void => {
    this.toggleClass("header--scrolled", window.scrollY > 20);
  };

  private initScrollHandler(): void {
    window.addEventListener("scroll", this.scrollHandler, { passive: true });
  }

  public destroy(): void {
    window.removeEventListener("scroll", this.scrollHandler);
    super.destroy();
  }
}
