import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import type { ITopic } from "@/types/shared/widget.types";
import type { IUserTopicProgress } from "@/types/shared/user.types";
import { widgetsApi } from "@/api/widgets.api";
import { progressApi } from "@/api/progress.api";

export class Library extends BaseComponent implements Page {
  private topics: ITopic[] = [];
  private progress: IUserTopicProgress[] = [];

  constructor() {
    super({ tag: "div", className: "library" });

    this.init();
  }

  public async init(): Promise<void> {
    [this.topics, this.progress] = await Promise.all([
      this.loadTopics(),
      this.loadProgress(),
    ]);

    console.log(this.topics);
    console.log(this.progress);
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
}
