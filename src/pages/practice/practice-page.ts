import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import { widgetsApi } from "@/api/widgets.api";
import type { ITopic, Widget, WidgetAnswer } from "@/types/shared/widget.types";
import widgetEngine from "@/services/widget-engine";
import "./practice-page.scss";
import { VerdictCard } from "@/components/widgets/verdict-card/verdict-card";
import Link from "@/components/link/link";
import { ROUTES } from "@/constants/routes";
import { router } from "@/router/router";
import { progressApi } from "@/api/progress.api";
import type { IUserStats, IUserTopicProgress } from "@/types/shared/user.types";
import { PracticeStats } from "@/components/layout/practice-stats/practice-stats";
import { TopicCompletedCard } from "@/components/topic-completed-card/topic-completed-card";
import Notification from "@/components/notification/notification";
import { NotificationType } from "@/constants/notification";
import type { IApiError } from "@/types/shared";
import { i18n } from "@/services/localization-service.ts";

export class PracticePage extends BaseComponent implements Page {
  private readonly topicId: string;
  private currentIndex = 0;
  private widgets: Widget[] = [];
  private topic: ITopic | undefined = undefined;
  private progress: IUserTopicProgress | undefined = undefined;
  private userStats: IUserStats | undefined = undefined;

  private mainArea: BaseComponent | undefined = undefined;
  private rightPanel: BaseComponent | undefined = undefined;
  private widgetArea: BaseComponent | undefined = undefined;
  private header: BaseComponent | undefined = undefined;

  private progressText: BaseComponent | undefined = undefined;
  private progressFill: BaseComponent | undefined = undefined;

  constructor(topicId: string) {
    super({ className: "practice-page" });
    this.topicId = topicId;

    this.init();
  }

  public async init(): Promise<void> {
    this.renderLayout();
    this.topic = await this.loadTopic();
    if (!this.topic) {
      router.navigate(ROUTES.LIBRARY);
      return;
    }
    this.widgets = await this.loadWidgets();
    if (this.widgets.length === 0) {
      router.navigate(ROUTES.LIBRARY);
      return;
    }
    this.userStats = await this.loadGlobalStats();
    this.progress = await this.loadProgress();

    if (this.progress?.isCompleted) {
      this.showCompletedScreen();
      return;
    }

    if (this.progress && !this.progress.isUnlocked) {
      Notification.show(i18n.t().widgets.locked, NotificationType.ERROR);
      router.navigate(ROUTES.LIBRARY);
      return;
    }

    this.currentIndex = this.progress
      ? this.loadCurrentIndex(this.progress)
      : 0;
    this.renderHeader();
    this.renderCurrentWidget();
    this.renderRightPanel();
  }

  private renderLayout(): void {
    const content = new BaseComponent({
      className: "practice-page__content",
      parent: this,
    });

    this.mainArea = new BaseComponent({
      className: "practice-page__main",
      parent: content,
    });

    this.rightPanel = new BaseComponent({
      tag: "aside",
      className: "practice-page__right-panel",
      parent: content,
    });

    this.header = new BaseComponent({
      className: "practice-page__header",
      parent: this.mainArea,
    });

    this.widgetArea = new BaseComponent({
      className: "practice-page__widget-area",
      parent: this.mainArea,
    });
  }

  private renderHeader(): void {
    const breadcrumb = new BaseComponent({
      className: "practice-page__breadcrumb",
      parent: this.header,
    });

    new Link({
      text: i18n.t().sidebar.nav.library,
      className: "practice-page__breadcrumb-link",
      href: `#${ROUTES.LIBRARY}`,
      parent: breadcrumb,
    });

    new BaseComponent({
      tag: "span",
      text: i18n.t().breadcrumbs.separator,
      parent: breadcrumb,
    });

    new BaseComponent({
      tag: "span",
      text:
        this.topic && i18n.getLocalizedField(this.topic.title)
          ? i18n.getLocalizedField(this.topic.title)
          : this.topicId,
      parent: breadcrumb,
    });

    this.renderProgressBar();
  }

  private renderProgressBar(): void {
    const progressWrapper = new BaseComponent({
      className: "practice-page__progress",
      parent: this.header,
    });

    this.progressText = new BaseComponent({
      tag: "span",
      className: "practice-page__progress-text",
      parent: progressWrapper,
    });

    const track = new BaseComponent({
      className: "practice-page__progress-track",
      parent: progressWrapper,
    });

    this.progressFill = new BaseComponent({
      className: "practice-page__progress-fill",
      parent: track,
    });

    this.updateProgress();
  }

  private async loadProgress(): Promise<IUserTopicProgress | undefined> {
    try {
      return await progressApi.getByTopicId(this.topicId);
    } catch (error) {
      const apiError = error as IApiError;
      if (apiError.status === 404) {
        return await progressApi.initTopic(this.topicId);
      }
      console.error(error);
      return undefined;
    }
  }

  private async loadGlobalStats(): Promise<IUserStats | undefined> {
    try {
      return await progressApi.getUserStats();
    } catch (error) {
      console.error("Stats loading failed", error);
      return undefined;
    }
  }

  private loadCurrentIndex(progress: IUserTopicProgress): number {
    let lastCompleted = -1;
    for (let index = this.widgets.length - 1; index >= 0; index--) {
      if (progress.completedWidgetIds.includes(this.widgets[index].id)) {
        lastCompleted = index;
        break;
      }
    }
    const nextIndex = lastCompleted + 1;
    return nextIndex >= this.widgets.length ? 0 : nextIndex;
  }

  private updateProgress(): void {
    const total = this.widgets.length;
    const current = this.currentIndex + 1;
    const percent = Math.round((current / total) * 100);

    this.progressText?.setText(`${current} / ${total}`);
    if (this.progressFill) {
      this.progressFill.getNode().style.width = `${percent}%`;
    }
  }

  private async loadTopic(): Promise<ITopic | undefined> {
    try {
      return await widgetsApi.getTopicById(this.topicId);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  private async loadWidgets(): Promise<Widget[]> {
    try {
      const data = await widgetsApi.getWidgetsByTopicId(this.topicId);
      return data.filter((w) => widgetEngine.getStrategy(w.type) !== undefined);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  private renderCurrentWidget(): void {
    if (this.currentIndex < 0 || this.currentIndex >= this.widgets.length)
      return;

    const currentWidget = this.widgets[this.currentIndex];

    const widgetComponent = widgetEngine.renderWidget(
      currentWidget,
      (answer: WidgetAnswer) => this.handleAnswer(answer),
    );

    if (!widgetComponent) {
      this.goToNext();
      return;
    }

    if (!this.widgetArea) return;

    this.widgetArea.getNode().replaceChildren();
    this.widgetArea.addChildren([widgetComponent]);
  }

  private renderRightPanel(): void {
    if (!this.rightPanel) return;
    this.rightPanel.getNode().replaceChildren();
    this.rightPanel.addChildren([
      new PracticeStats(this.progress, this.userStats),
    ]);
  }

  private async handleAnswer(answer: WidgetAnswer): Promise<void> {
    const widget = this.widgets[this.currentIndex];
    if (!widget) return;

    try {
      const verdict = await widgetsApi.submitAnswer(widget.id, answer);

      await progressApi.update({
        topicId: this.topicId,
        widgetId: widget.id,
        xpEarned: verdict.xpEarned,
        totalWidgets: this.widgets.length,
      });

      this.progress = await this.loadProgress();

      this.userStats = await this.loadGlobalStats();
      this.renderRightPanel();

      widgetEngine.showVerdict(widget, verdict);

      const verdictCard = new VerdictCard(verdict, () => this.goToNext());
      this.widgetArea?.addChildren([verdictCard]);
    } catch (error) {
      console.error(error);
    }
  }

  private showCompletedScreen(): void {
    if (!this.widgetArea || !this.progress) return;
    this.widgetArea.getNode().replaceChildren();
    this.widgetArea.addChildren([
      new TopicCompletedCard(
        this.progress,
        () => this.retryTopic(),
        () => router.navigate(ROUTES.LIBRARY),
      ),
    ]);
  }

  private async retryTopic(): Promise<void> {
    await progressApi.resetTopic(this.topicId);
    this.progress = await this.loadProgress();
    this.currentIndex = 0;
    this.updateProgress();
    this.renderCurrentWidget();
    this.renderRightPanel();
  }

  private goToNext(): void {
    this.currentIndex++;

    if (this.currentIndex >= this.widgets.length) {
      this.showCompletedScreen();
      return;
    }

    this.updateProgress();
    this.renderCurrentWidget();
  }
}
