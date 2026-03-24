import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import type { ITopic } from "@/types/shared/widget.types";
import type { IUserTopicProgress } from "@/types/shared/user.types";
import { widgetsApi } from "@/api/widgets.api";
import { progressApi } from "@/api/progress.api";
import { TopicCard } from "@/components/topic-card/topic-card";
import "./library.scss";
import widgetEngine from "@/services/widget-engine";

export class Library extends BaseComponent implements Page {
  private topics: ITopic[] = [];
  private progress: IUserTopicProgress[] = [];
  private widgetCounts = new Map<string, number>();

  constructor() {
    super({ tag: "div", className: "library" });
    void this.init();
  }

  public async init(): Promise<void> {
    [this.topics, this.progress] = await Promise.all([
      this.loadTopics(),
      this.loadProgress(),
    ]);

    // TODO: remove loadWidgetCounts() when all widget strategy types are implemented and pass topic.widgetIds.length directly to TopicCard
    await this.loadWidgetCounts();
    this.renderTopics();
  }

  private async loadTopics(): Promise<ITopic[]> {
    try {
      const { data } = await widgetsApi.getTopics();
      return data;
    } catch {
      return [];
    }
  }

  private async loadProgress(): Promise<IUserTopicProgress[]> {
    try {
      return await progressApi.getAll();
    } catch {
      return [];
    }
  }

  private async loadWidgetCounts(): Promise<void> {
    await Promise.all(
      this.topics.map(async (topic) => {
        try {
          const { data } = await widgetsApi.getWidgetsByTopicId(topic.id);
          const implemented = data.filter(
            (w) => widgetEngine.getStrategy(w.type) !== undefined,
          ).length;
          this.widgetCounts.set(topic.id, implemented);
        } catch {
          this.widgetCounts.set(topic.id, topic.widgetIds.length);
        }
      }),
    );
  }

  private async renderTopics(): Promise<void> {
    const grid = new BaseComponent({
      className: "library__grid",
      parent: this,
    });

    const allProgress = await Promise.all(
      this.topics.map(async (topic) => {
        let p = this.progress.find((p) => p.topicId === topic.id);
        if (!p) p = await progressApi.initTopic(topic.id);
        return { topic, progress: p };
      }),
    );

    for (const { topic, progress } of allProgress) {
      const total = this.widgetCounts.get(topic.id) ?? topic.widgetIds.length;
      grid.addChildren([new TopicCard(topic, progress, total)]);
    }
  }
}
