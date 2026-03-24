import { apiService } from "./api/api-service";
import AIChat from "./components/ai-chat/ai-chat";
import AuthModal from "./components/auth-modal/auth-modal";
import Notification from "./components/notification/notification";
import { NotFoundContent } from "./components/not-found-content/not-found-content";
import { QuizStrategy } from "./components/widgets/quiz/quiz-strategy";
import { TrueFalseStrategy } from "./components/widgets/true-false/true-false-strategy";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "./constants/app";
import { NotificationType } from "./constants/notification";
import { ROUTES } from "./constants/routes";
import { EN } from "./locale/en";
import { DashboardPage } from "./pages/dashboard/dashboard-page";
import { LandingPage } from "./pages/landing-page/landing-page";
import { Library } from "./pages/library/library";
import { PracticePage } from "./pages/practice/practice-page";
import { router } from "./router/router";
import widgetEngine from "./services/widget-engine";

export default class App {
  private readonly parentNode: HTMLElement;

  constructor(parentNode: HTMLElement) {
    this.parentNode = parentNode;
    this.restoreTheme();
    this.registerWidgets();
    this.initRoutes();
    this.initGlobalListeners();
  }

  private initGlobalListeners(): void {
    globalThis.addEventListener("auth:logout", () => {
      globalThis.addEventListener(
        "hashchange",
        () => {
          Notification.show(
            EN.common.error.session_expired,
            NotificationType.ERROR,
          );
        },
        { once: true },
      );
      router.navigate(ROUTES.LANDING);
    });
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
    router.register(ROUTES.AI_CHAT, () => new AIChat(), {
      isProtected: true,
    });
    router.register(
      ROUTES.PRACTICE,
      (parameters) => new PracticePage(parameters.topicId),
      {
        isProtected: true,
      },
    );
    router.register(ROUTES.LIBRARY, () => new Library(), {
      isProtected: true,
    });
    router.register(ROUTES.NOT_FOUND, () => new NotFoundContent(), {});
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
