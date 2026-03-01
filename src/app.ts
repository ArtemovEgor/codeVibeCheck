import { DEFAULT_THEME, THEME_STORAGE_KEY } from "./constants/app";
import { ROUTES } from "./constants/routes";
import { DashboardPage } from "./pages/dashboard/dashboard-page";
import { LandingPage } from "./pages/landing-page/landing-page";
import { router } from "./router/router";

export default class App {
  private readonly parentNode: HTMLElement;

  constructor(parentNode: HTMLElement) {
    this.parentNode = parentNode;
    this.restoreTheme();
    this.initRoutes();
  }

  private initRoutes(): void {
    router.setRootContainer(this.parentNode);
    router.register(ROUTES.LANDING, () => new LandingPage(), {
      isGuestOnly: true,
    });
    router.register(ROUTES.DASHBOARD, () => new DashboardPage(), {
      isProtected: true,
    });
  }

  private restoreTheme(): void {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME;
    document.documentElement.dataset.theme = saved;
  }
}
