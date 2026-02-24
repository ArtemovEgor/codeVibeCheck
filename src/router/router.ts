import BaseComponent from "@/components/base/base-component";
import Modal from "@/components/modal/modal";
import { ROUTES } from "@/constants/routes";
import type Page from "@/pages/page";

type RouteCallback = (parameters: Record<string, string>) => Page | Modal;

interface RouteOptions {
  isProtected?: boolean;
  isGuestOnly?: boolean;
  isModal?: boolean;
}

type Route = RouteOptions & {
  path: string;
  component: RouteCallback;
};

export default class Router {
  private routes = new Map<string, Route>();
  private rootContainer: HTMLElement | undefined = undefined;
  private currentPage: Page | undefined = undefined;
  private currentModal: Modal | undefined = undefined;
  private previousPagePath: string | undefined = undefined;
  private authCheck: () => boolean = () => false;

  constructor() {
    globalThis.addEventListener("hashchange", () => this.handlePathChange());
    globalThis.addEventListener("load", () => this.handlePathChange());
  }

  public setAuthCheck(authCheck: () => boolean): void {
    this.authCheck = authCheck;
  }

  public setRootContainer(container: HTMLElement): void {
    this.rootContainer = container;
  }

  public register(
    path: string,
    component: RouteCallback,
    options: RouteOptions = {},
  ): void {
    this.routes.set(path, {
      path,
      component,
      ...options,
    });
  }

  public navigate(path: string): void {
    const formattedPath = path.startsWith("/") ? path : `/${path}`;
    globalThis.location.hash = formattedPath;
  }

  private handlePathChange(): void {
    if (!globalThis.location.hash) {
      this.navigate(ROUTES.LANDING);
      return;
    }

    // Hash format: "#/path" → extracted as "/path"
    const currentPath = globalThis.location.hash.slice(1) || "/";
    const parameters: Record<string, string> = {};

    const route = this.findRoute(currentPath, parameters);

    if (!route) {
      this.navigate(ROUTES.NOT_FOUND);
      return;
    }

    const isLogged = this.authCheck();

    if (route.isProtected && !isLogged) {
      this.navigate(ROUTES.LOGIN);
      return;
    }

    if (route.isGuestOnly && isLogged) {
      this.navigate(ROUTES.DASHBOARD);
      return;
    }

    this.render(route, parameters);
  }

  private findRoute(
    currentPath: string,
    parameters: Record<string, string>,
  ): Route | undefined {
    if (this.routes.has(currentPath)) {
      return this.routes.get(currentPath);
    }

    for (const [routePath, route] of this.routes.entries()) {
      if (routePath.includes(":")) {
        // Convert "/practice/:topicId" → /^\/practice\/([^/]+)$/
        const routeMatcher = new RegExp(
          `^${routePath.replaceAll(/:[^\s/]+/g, "([^/]+)")}$`,
        );
        const match = currentPath.match(routeMatcher);

        if (match) {
          const parameterNames = (routePath.match(/:[^\s/]+/g) || []).map((s) =>
            s.slice(1),
          );

          for (const [index, name] of parameterNames.entries()) {
            parameters[name] = match[index + 1];
          }

          return route;
        }
      }
    }

    return undefined;
  }

  private render(route: Route, parameters: Record<string, string>): void {
    if (!this.rootContainer) return;
    const component = route.component(parameters);
    if (route.isModal && component instanceof Modal) {
      this.renderModal(component);
    } else if (component instanceof BaseComponent) {
      this.renderPage(component, route.path);
    }
  }

  private renderPage(component: BaseComponent, path: string): void {
    this.closeCurrentModal();
    if (this.previousPagePath === path && this.currentPage) return;
    this.currentPage?.destroy();
    this.currentPage = component as unknown as Page;
    this.previousPagePath = path;
    this.rootContainer?.replaceChildren(component.getNode());
  }

  private renderModal(modal: Modal): void {
    if (!this.currentPage) {
      const pagePath = this.previousPagePath ?? ROUTES.LANDING;
      const parameters: Record<string, string> = {};
      const route = this.findRoute(pagePath, parameters);
      if (route && !route.isModal) {
        const page = route.component(parameters);
        if (page instanceof BaseComponent) {
          this.renderPage(page, route.path);
        }
      }
    }
    this.closeCurrentModal();
    this.currentModal = modal;
    if (this.rootContainer) {
      modal.addTo(this.rootContainer);
      modal.showModal();
      modal.getNode().addEventListener(
        "close",
        () => {
          this.currentModal?.destroy();
          this.currentModal = undefined;
          this.navigateBack();
        },
        { once: true },
      );
    }
  }

  private closeCurrentModal(): void {
    if (this.currentModal) {
      this.currentModal.destroy();
      this.currentModal = undefined;
    }
  }

  private navigateBack(): void {
    const path = this.previousPagePath ?? ROUTES.LANDING;
    history.replaceState(undefined, "", `#${path}`);
  }
}

export const router = new Router();
