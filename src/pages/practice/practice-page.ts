import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import { widgetsApi } from "@/api/widgets.api";
import type { ITopic, Widget, WidgetAnswer } from "@/types/shared/widget.types";
import widgetEngine from "@/services/widget-engine";
import "./practice-page.scss";
import { EN } from "@/locale/en";
import { NotificationType } from "@/constants/notification";
import Notification from "../../components/notification/notification";
import { VerdictCard } from "@/components/widgets/verdict-card/verdict-card";
import Link from "@/components/link/link";
import { ROUTES } from "@/constants/routes";

export class PracticePage extends BaseComponent implements Page {
  private topicId: string;
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
    this.widgets = await this.loadWidgets();
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

  private renderHeader() {
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
      text: " › ",
      parent: breadcrumb,
    });

    new BaseComponent({
      tag: "span",
      text: this.topic?.title.en ?? this.topicId,
      parent: breadcrumb,
    });

    this.renderProgressBar();
  }

  private renderProgressBar() {
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

  private updateProgress(): void {
    const total = this.widgets.length;
    const current = this.currentIndex + 1;
    const percent = Math.round((this.currentIndex / total) * 100);

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

  private renderCurrentWidget() {
    const widgetComponent = widgetEngine.renderWidget(
      this.widgets[this.currentIndex],
      (answer: WidgetAnswer) => this.handleAnswer(answer),
    );
    if (!widgetComponent) return;

    this.widgetArea?.getNode().replaceChildren();
    this.widgetArea?.addChildren([widgetComponent]);
  }

  private async handleAnswer(answer: WidgetAnswer): Promise<void> {
    const widget = this.widgets[this.currentIndex];
    if (!widget) return;

    try {
      const { data: verdict } = await widgetsApi.submitAnswer(
        widget.id,
        answer,
      );

      widgetEngine.showVerdict(widget, verdict);

      const message = verdict.isCorrect
        ? `${EN.widgets.answer.correct} +${verdict.xpEarned} XP`
        : EN.widgets.answer.wrong;
      const type = verdict.isCorrect
        ? NotificationType.SUCCESS
        : NotificationType.ERROR;
      Notification.show(message, type);

      const verdictCard = new VerdictCard(verdict, () => this.goToNext());
      this.widgetArea?.addChildren([verdictCard]);
    } catch (error) {
      console.error(error);
    }
  }

  private goToNext(): void {
    this.currentIndex++;
    this.updateProgress();
    if (this.currentIndex >= this.widgets.length) {
      // TODO: results screen
      console.log("Topic completed!");
      return;
    }
    this.renderCurrentWidget();
  }
}
