import BaseComponent from "@/components/base/base-component";
import { ROUTES } from "@/constants/routes";
import type Page from "@/pages/page";

type RouteCallback = (parameters: Record<string, string>) => Page;

interface RouteOptions {
  isProtected?: boolean;
  isGuestOnly?: boolean;
}

type Route = RouteOptions & {
  path: string;
  component: RouteCallback;
};

export default class Router {
  private routes = new Map<string, Route>();
  private rootContainer: HTMLElement | undefined = undefined;
  private currentPage: Page | undefined = undefined;
  private authCheck: () => boolean = () => false;

  constructor() {
    globalThis.addEventListener("hashchange", () => this.handlePathChange());
    window.addEventListener("load", () => this.handlePathChange());
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
    const currentPath = globalThis.location.hash.slice(1) || "/";
    const parameters: Record<string, string> = {};

    const route = this.findRoute(currentPath, parameters);

    if (!route) {
      this.navigate(ROUTES.NOT_FOUND || "/404");
      return;
    }

    const isLogged = this.authCheck();

    if (route.isProtected && !isLogged) {
      this.navigate(ROUTES.LOGIN || "/login");
      return;
    }

    if (route.isGuestOnly && isLogged) {
      this.navigate(ROUTES.DASHBOARD || "/dashboard");
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

    if (this.currentPage) {
      this.currentPage.destroy();
    }

    const page = route.component(parameters);
    this.currentPage = page;

    if (page instanceof BaseComponent) {
      this.rootContainer.replaceChildren(page.getNode());
    }
  }
}

export const router = new Router();
