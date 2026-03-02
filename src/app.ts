import { apiService } from "./api/api-service";
import AuthModal from "./components/auth-modal/auth-modal";
import { QuizStrategy } from "./components/widgets/quiz/quiz-strategy";
import { TrueFalseStrategy } from "./components/widgets/true-false/true-false";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "./constants/app";
import { ROUTES } from "./constants/routes";
import { DashboardPage } from "./pages/dashboard/dashboard-page";
import { LandingPage } from "./pages/landing-page/landing-page";
import { router } from "./router/router";
import widgetEngine from "./services/widget-engine";

export default class App {
  private readonly parentNode: HTMLElement;

  constructor(parentNode: HTMLElement) {
    this.parentNode = parentNode;
    this.restoreTheme();
    this.registerWidgets();
    this.initRoutes();
  }

  private initRoutes(): void {
    router.setRootContainer(this.parentNode);
    router.setAuthCheck(() => apiService.getToken() !== undefined);

    router.register(ROUTES.LANDING, () => new LandingPage(), {
      isGuestOnly: true,
    });
    router.register(ROUTES.LOGIN, () => new AuthModal("login"), {
      isGuestOnly: true,
      isModal: true,
    });
    router.register(ROUTES.REGISTER, () => new AuthModal("register"), {
      isGuestOnly: true,
      isModal: true,
    });
    router.register(ROUTES.DASHBOARD, () => new DashboardPage(), {
      isProtected: true,
    });
  }

  private restoreTheme(): void {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME;
    document.documentElement.dataset.theme = saved;
  }

  private registerWidgets(): void {
    widgetEngine.register(new QuizStrategy());
    widgetEngine.register(new TrueFalseStrategy());
  }
}
