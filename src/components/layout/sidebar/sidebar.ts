import BaseComponent from "@/components/base/base-component";
import Link from "@/components/link/link";
import { ROUTES } from "@/constants/routes";
import { EN } from "@/locale/en";
import { ThemeSwitcher } from "../theme-switcher/theme-switcher";
import "./sidebar.scss";
import { SIDEBAR_ICONS } from "@/assets/icons";

interface IUserView {
  displayName: string;
  avatarUrl: string;
}

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
  private navLinks: BaseComponent[] = [];

  constructor() {
    super({ tag: "aside", className: "app-layout__sidebar" });
    this.render();
  }

  private render(): void {
    const user = this.getUser();
    this.renderSidebarLogo();
    this.renderSidebarNav();
    this.renderSidebarFooter(user);
  }

  // TODO: authService.getUser()
  private getUser(): IUserView {
    return {
      displayName: "Alex",
      avatarUrl: "",
    };
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
      const link = this.renderNavLink(item);
      nav.addChildren([link]);
      this.navLinks.push(link);
    }

    this.updateActive();
    globalThis.addEventListener("hashchange", this.updateActive);
  }

  private renderNavLink(item: (typeof NAV_ITEMS)[number]): BaseComponent {
    const link = new Link({
      href: `#${item.href}`,
      className: "nav-link",
    });

    const iconSvg = new BaseComponent({
      tag: "span",
      className: `nav-link__icon ${item.className}`,
      parent: link,
    });
    const iconKey = item.href.startsWith("/") ? item.href.slice(1) : item.href;
    iconSvg.getNode().innerHTML =
      SIDEBAR_ICONS[iconKey as keyof typeof SIDEBAR_ICONS] || "";

    new BaseComponent({
      tag: "span",
      className: "nav-link__text",
      text: item.text,
      parent: link,
    });

    return link;
  }

  private renderSidebarFooter(user: IUserView): void {
    const sidebarFooterWrap = new BaseComponent({
      className: "sidebar__footer",
      parent: this,
    });

    const userWrap = new BaseComponent({
      className: "sidebar__user",
      parent: sidebarFooterWrap,
    });

    this.renderAvatar(userWrap, user);

    new BaseComponent({
      tag: "span",
      className: "sidebar__username",
      text: user.displayName,
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
    });
  }

  private renderAvatar(parent: BaseComponent, user: IUserView): void {
    const userName = user.displayName;
    const avatarUrl = user.avatarUrl;

    const avatar = new BaseComponent({
      tag: "div",
      className: "sidebar__avatar",
      parent,
    });

    if (avatarUrl) {
      const img = new BaseComponent<HTMLImageElement>({
        tag: "img",
        className: "sidebar__avatar-img",
        parent: avatar,
      });
      img.getNode().src = avatarUrl;
      img.getNode().alt = userName;
    } else {
      avatar.setText(userName.charAt(0).toUpperCase());
    }
  }

  public onNavLinkClick(callback: () => void): void {
    for (const link of this.navLinks) {
      link.on("click", callback);
    }
  }

  private updateActive = (): void => {
    const currentPath = globalThis.location.hash.slice(1) || "/";
    for (let index = 0; index < this.navLinks.length; index++) {
      const linkNode = this.navLinks[index].getNode();
      linkNode.classList.toggle(
        "nav-link--active",
        currentPath === NAV_ITEMS[index].href,
      );
    }
  };

  public destroy(): void {
    globalThis.removeEventListener("hashchange", this.updateActive);
    super.destroy();
  }
}
