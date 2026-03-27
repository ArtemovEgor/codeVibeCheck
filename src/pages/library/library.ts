import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import type { ITopic } from "@/types/shared/widget.types";
import type { IUserTopicProgress } from "@/types/shared/user.types";
import { widgetsApi } from "@/api/widgets.api";
import { progressApi } from "@/api/progress.api";
import { TopicCard } from "@/components/topic-card/topic-card";
import "./library.scss";
import widgetEngine from "@/services/widget-engine";
import Notification from "@/components/notification/notification";
import { NotificationType } from "@/constants/notification";
import type { IApiError } from "@/types/shared";
import { EN } from "@/locale/en";
import { Button } from "@/components/button/button";

export class Library extends BaseComponent implements Page {
  private topics: ITopic[] = [];
  private progress: IUserTopicProgress[] = [];
  private widgetCounts = new Map<string, number>();
  private scrollHandler: (() => void) | undefined = undefined;
  private emptyState: BaseComponent | undefined = undefined;
  private cardElements: {
    topicId: string;
    element: HTMLElement;
    title: string;
  }[] = [];

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
    this.renderScrollToTop();
  }

  private async loadTopics(): Promise<ITopic[]> {
    try {
      const { data } = await widgetsApi.getTopics();
      return data;
    } catch (error) {
      const apiError = error as IApiError;
      Notification.show(apiError.message, NotificationType.ERROR);
      return [];
    }
  }

  private async loadProgress(): Promise<IUserTopicProgress[]> {
    try {
      return await progressApi.getAll();
    } catch (error) {
      console.warn(error);
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

  private renderTopics(): void {
    this.getNode().replaceChildren();
    this.renderSearch();

    const grid = new BaseComponent({
      className: "library__grid",
      parent: this,
    });

    this.cardElements = [];
    const allProgress = this.getAllTopicProgress();
    const titlesMap = new Map(this.topics.map((t) => [t.id, t.title.en]));

    let index = 0;
    for (const { topic, progress } of allProgress) {
      const total = this.widgetCounts.get(topic.id) ?? topic.widgetIds.length;
      const card = new TopicCard(topic, progress, total, titlesMap);

      card.getNode().style.setProperty("--stagger-index", index.toString());

      this.cardElements.push({
        topicId: topic.id,
        element: card.getNode(),
        title: topic.title.en,
      });

      grid.addChildren([card]);
      index++;
    }

    this.emptyState = new BaseComponent({
      className: "library__empty",
      parent: this,
    });

    new BaseComponent({
      tag: "p",
      text: EN.search.icon,
      className: "library__empty-icon",
      parent: this.emptyState,
    });

    new BaseComponent({
      tag: "p",
      text: EN.search.empty,
      parent: this.emptyState,
    });
  }

  private getAllTopicProgress() {
    const completedTopicIds = new Set(
      this.progress.filter((p) => p.everCompleted).map((p) => p.topicId),
    );

    return this.topics.map((topic) => {
      let p = this.progress.find((p) => p.topicId === topic.id);
      if (!p) {
        const isUnlocked = topic.requiredTopicIds.every((requestId) =>
          completedTopicIds.has(requestId),
        );

        p = {
          topicId: topic.id,
          completedWidgetIds: [],
          everCompleted: false,
          isCompleted: false,
          isUnlocked: isUnlocked,
          xpEarned: 0,
        };
      }

      return { topic, progress: p };
    });
  }

  private renderSearch(): void {
    const searchContainer = new BaseComponent({
      className: "library__search-wrapper",
      parent: this,
    });

    const inputWrapper = new BaseComponent({
      className: "library__search-input-wrapper",
      parent: searchContainer,
    });

    const searchInput = new BaseComponent<HTMLInputElement>({
      tag: "input",
      className: "library__search-input",
      parent: inputWrapper,
      attributes: { placeholder: EN.search.placeholder },
    });

    const clearButton = new BaseComponent({
      className: "library__search-clear",
      text: EN.search.clear,
      parent: inputWrapper,
    });

    searchInput.on("input", () => {
      const value = searchInput.getNode().value.toLowerCase().trim();
      this.filterCards(value);
      this.toggleClearButton(clearButton, value);
    });

    clearButton.on("click", () => {
      searchInput.getNode().value = "";
      this.filterCards("");
      this.toggleClearButton(clearButton, "");
    });
  }

  private filterCards(searchString: string): void {
    let hasVisible = false;

    for (const { element, title } of this.cardElements) {
      const isVisible =
        searchString === "" || title.toLowerCase().includes(searchString);
      element.classList.toggle("library__card--hidden", !isVisible);
      if (isVisible) hasVisible = true;
    }

    this.emptyState
      ?.getNode()
      .classList.toggle("library__empty--visible", !hasVisible);
  }

  private toggleClearButton(button: BaseComponent, value: string): void {
    button
      .getNode()
      .classList.toggle("library__search-clear--visible", value.length > 0);
  }

  private renderScrollToTop(): void {
    const button = new Button({
      className: "library__scroll-top",
      text: EN.arrow_up,
      parent: this,
    });

    const scrollContainer = this.getNode().parentElement;
    if (!scrollContainer) return;

    this.scrollHandler = (): void => {
      button
        .getNode()
        .classList.toggle(
          "library__scroll-top--visible",
          scrollContainer.scrollTop > 300,
        );
    };

    scrollContainer.addEventListener("scroll", this.scrollHandler);

    button.on("click", () =>
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" }),
    );
  }

  public destroy(): void {
    const scrollContainer = this.getNode().parentElement;
    if (this.scrollHandler && scrollContainer) {
      scrollContainer.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = undefined;
    }
    super.destroy();
  }
}
