import { EN } from "@/locale/en";
import BaseComponent from "../../base/base-component";
import Link from "../../link/link";
import { ThemeSwitcher } from "../theme-switcher/theme-switcher";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/constants/app";
import { SCROLL_THRESHOLD } from "./header.constants";
import "./header.scss";

export class Header extends BaseComponent {
  constructor() {
    super({ tag: "header", className: "header" });
    this.restoreTheme();
    this.render();
    this.initScrollHandler();
  }

  private restoreTheme(): void {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME;
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
      text: EN.common.app.logo,
      parent: logoLink,
    });

    new BaseComponent({
      tag: "span",
      className: "logo__text",
      text: EN.common.app.name,
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
    this.toggleClass("header--scrolled", window.scrollY > SCROLL_THRESHOLD);
  };

  private initScrollHandler(): void {
    window.addEventListener("scroll", this.scrollHandler, { passive: true });
  }

  public destroy(): void {
    window.removeEventListener("scroll", this.scrollHandler);
    super.destroy();
  }
}
