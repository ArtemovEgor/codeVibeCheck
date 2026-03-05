import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import { widgetsApi } from "@/api/widgets.api";

export class PracticePage extends BaseComponent implements Page {
  private topicId: string;

  constructor(topicId: string) {
    super({ tag: "div", className: "practice-page" });
    this.topicId = topicId;
    this.init();
  }

  public init(): void {
    this.loadWidgets();
  }

  private async loadWidgets(): Promise<void> {
    const response = await widgetsApi.getWidgetsByTopicId(this.topicId);
    console.log(response.data);
  }
}
