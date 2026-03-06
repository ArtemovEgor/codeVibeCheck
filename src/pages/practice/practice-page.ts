import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import { widgetsApi } from "@/api/widgets.api";
import type { Widget, WidgetAnswer } from "@/types/shared/widget.types";
import widgetEngine from "@/services/widget-engine";
import "./practice-page.scss";

export class PracticePage extends BaseComponent implements Page {
  private topicId: string;
  private currentIndex = 0;
  private widgets: Widget[] = [];

  private mainArea: BaseComponent;
  private rightPanel: BaseComponent;
  private widgetArea: BaseComponent;

  constructor(topicId: string) {
    super({ tag: "div", className: "practice-page" });
    this.topicId = topicId;

    // Layout
    const content = new BaseComponent({
      tag: "div",
      className: "practice-page__content",
      parent: this,
    });

    this.mainArea = new BaseComponent({
      tag: "div",
      className: "practice-page__main",
      parent: content,
    });

    this.rightPanel = new BaseComponent({
      tag: "aside",
      className: "practice-page__right-panel",
      parent: content,
    });

    new BaseComponent({
      tag: "div",
      className: "practice-page__header",
      parent: this.mainArea,
    });

    this.widgetArea = new BaseComponent({
      tag: "div",
      className: "practice-page__widget-area",
      parent: this.mainArea,
    });

    // TODO: add stats
    new BaseComponent({
      tag: "p",
      className: "practice-page__panel-placeholder",
      text: "Stats coming soon",
      parent: this.rightPanel,
    });

    this.init();
  }

  public async init(): Promise<void> {
    this.widgets = await this.loadWidgets();
    this.renderCurrentWidget();
  }

  private async loadWidgets(): Promise<Widget[]> {
    try {
      const widgets = await widgetsApi.getWidgetsByTopicId(this.topicId);
      return widgets.data;
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
      console.log(verdict); // TODO: show VerdictCard
    } catch (error) {
      console.error(error);
    }
  }
}
