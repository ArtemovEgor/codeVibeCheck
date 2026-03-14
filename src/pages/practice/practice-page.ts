import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import { widgetsApi } from "@/api/widgets.api";
import type { ITopic, Widget, WidgetAnswer } from "@/types/shared/widget.types";
import widgetEngine from "@/services/widget-engine";
import "./practice-page.scss";
import { EN } from "@/locale/en";
import { VerdictCard } from "@/components/widgets/verdict-card/verdict-card";
import Link from "@/components/link/link";
import { ROUTES } from "@/constants/routes";
import { router } from "@/router/router";
import { progressApi } from "@/api/progress.api";
import type { IUserTopicProgress } from "@/types/shared/user.types";

export class PracticePage extends BaseComponent implements Page {
  private readonly topicId: string;
  private currentIndex = 0;
  private widgets: Widget[] = [];
  private topic: ITopic | undefined = undefined;

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
    this.currentIndex = await this.loadCurrentIndex();
    this.renderHeader();
    this.renderCurrentWidget();
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

    // TODO: add stats
    new BaseComponent({
      tag: "p",
      className: "practice-page__panel-placeholder",
      text: EN.widgets.placeholder,
      parent: this.rightPanel,
    });
  }

  private renderHeader(): void {
    const breadcrumb = new BaseComponent({
      className: "practice-page__breadcrumb",
      parent: this.header,
    });

    new Link({
      text: EN.sidebar.nav.library,
      className: "practice-page__breadcrumb-link",
      href: `#${ROUTES.LIBRARY}`,
      parent: breadcrumb,
    });

    new BaseComponent({
      tag: "span",
      text: EN.breadcrumbs.separator,
      parent: breadcrumb,
    });

    new BaseComponent({
      tag: "span",
      text: this.topic?.title.en ?? this.topicId,
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

  private async loadCurrentIndex(): Promise<number> {
    try {
      const progress: IUserTopicProgress = await progressApi.getByTopicId(
        this.topicId,
      );
      let lastCompleted = -1;
      for (let index = this.widgets.length - 1; index >= 0; index--) {
        if (progress.completedWidgetIds.includes(this.widgets[index].id)) {
          lastCompleted = index;
          console.log(index);
          break;
        }
      }
      const nextIndex = lastCompleted + 1;
      return nextIndex >= this.widgets.length ? 0 : nextIndex;
    } catch {
      return 0;
    }
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
      const { data } = await widgetsApi.getTopicById(this.topicId);
      return data;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  private async loadWidgets(): Promise<Widget[]> {
    try {
      const { data } = await widgetsApi.getWidgetsByTopicId(this.topicId);
      return data;
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

  private async handleAnswer(answer: WidgetAnswer): Promise<void> {
    const widget = this.widgets[this.currentIndex];
    if (!widget) return;

    try {
      const { data: verdict } = await widgetsApi.submitAnswer(
        widget.id,
        answer,
      );

      await progressApi.update({
        topicId: this.topicId,
        widgetId: widget.id,
        xpEarned: verdict.xpEarned,
      });

      widgetEngine.showVerdict(widget, verdict);

      const verdictCard = new VerdictCard(verdict, () => this.goToNext());
      this.widgetArea?.addChildren([verdictCard]);
    } catch (error) {
      console.error(error);
    }
  }

  private goToNext(): void {
    this.currentIndex++;

    if (this.currentIndex >= this.widgets.length) {
      // TODO: results screen
      console.log("Topic completed!");
      router.navigate(ROUTES.LIBRARY);
      return;
    }

    this.updateProgress();
    this.renderCurrentWidget();
  }
}
