import BaseComponent from "@/components/base/base-component";
import Link from "@/components/link/link";
import { ROUTES } from "@/constants/routes";
import { EN } from "@/locale/en";
import { ThemeSwitcher } from "../theme-switcher/theme-switcher";
import "./sidebar.scss";
import { SIDEBAR_ICONS } from "@/assets/icons";

const NAV_ITEMS = [
  {
    text: EN.sidebar.nav.dashboard,
    href: ROUTES.DASHBOARD,
    className: "nav__icon--dashboard",
  },
  {
    text: EN.sidebar.nav.library,
    href: ROUTES.LIBRARY,
    className: "nav__icon--library",
  },
  {
    text: EN.sidebar.nav.aiChat,
    href: ROUTES.AI_CHAT,
    className: "nav__icon--ai",
  },
  {
    text: EN.sidebar.nav.profile,
    href: ROUTES.PROFILE,
    className: "nav__icon--profile",
  },
] as const;

export class Sidebar extends BaseComponent {
  constructor() {
    super({ tag: "aside", className: "app-layout__sidebar" });
    this.render();
  }

  private render(): void {
    this.renderSidebarLogo();
    this.renderSidebarNav();
    this.renderSidebarFooter();
  }

  private renderSidebarLogo(): void {
    const sidebarLogoWrap = new BaseComponent({
      className: "sidebar__logo",
      parent: this,
    });

    const logo = new Link({
      href: `#${ROUTES.LANDING}`,
      className: "logo",
      parent: sidebarLogoWrap,
    });

    new BaseComponent({
      tag: "span",
      className: "logo__icon",
      text: EN.common.app.logo,
      parent: logo,
    });

    new BaseComponent({
      tag: "span",
      className: "logo__text",
      text: EN.common.app.name,
      parent: logo,
    });
  }

  private renderSidebarNav(): void {
    const nav = new BaseComponent({
      tag: "nav",
      className: "sidebar__nav",
      parent: this,
    });

    for (const item of NAV_ITEMS) {
      const link = new Link({
        href: `#${item.href}`,
        className: "nav-link",
        parent: nav,
      });

      const iconSvg = new BaseComponent({
        tag: "span",
        className: `nav-link__icon ${item.className}`,
        parent: link,
      });
      const iconKey = item.href.startsWith("/")
        ? item.href.slice(1)
        : item.href;
      iconSvg.getNode().innerHTML =
        SIDEBAR_ICONS[iconKey as keyof typeof SIDEBAR_ICONS] || "";

      new BaseComponent({
        tag: "span",
        className: "nav-link__text",
        text: item.text,
        parent: link,
      });
    }
  }

  private renderSidebarFooter(): void {
    const sidebarFooterWrap = new BaseComponent({
      className: "sidebar__footer",
      parent: this,
    });

    const userWrap = new BaseComponent({
      className: "sidebar__user",
      parent: sidebarFooterWrap,
    });

    new BaseComponent({
      tag: "div",
      className: "sidebar__avatar",
      parent: userWrap,
    });

    new BaseComponent({
      tag: "span",
      className: "sidebar__username",
      text: "Alex",
      parent: userWrap,
    });

    sidebarFooterWrap.addChildren([
      new BaseComponent({ className: "sidebar__divider" }),
      new ThemeSwitcher(),
    ]);

    new BaseComponent({
      tag: "button",
      className: "btn sidebar__logout",
      text: EN.sidebar.nav.logout,
      parent: sidebarFooterWrap,
    }).on("click", () => {
      console.log("logout");
    });
  }
}
