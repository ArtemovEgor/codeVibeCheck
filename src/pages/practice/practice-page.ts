import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import { widgetsApi } from "@/api/widgets.api";
import type { Widget } from "@/types/shared/widget.types";
import widgetEngine from "@/services/widget-engine";

export class PracticePage extends BaseComponent implements Page {
  private topicId: string;
  private currentIndex = 0;
  private widgets: Widget[] = [];

  constructor(topicId: string) {
    super({ tag: "div", className: "practice-page" });
    this.topicId = topicId;
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
      () => {
        console.log("submit");
      },
    );
    if (!widgetComponent) return;

    this.getNode().replaceChildren();
    this.addChildren([widgetComponent]);
  }
}
