import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import type { ITopic } from "@/types/shared/widget.types";
import type { IUserTopicProgress } from "@/types/shared/user.types";
import { router } from "@/router/router";
import { ROUTES } from "@/constants/routes";
import { EN } from "@/locale/en";
import "./topic-card.scss";

const MAX_DIFFICULTY = 3;
const COLORS = [
  "#38a5e4",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#e727ce",
];

const TOPIC_ICONS: Record<string, string> = {
  "core-js": "JS",
  "array-methods": "[ ]",
  async: "{…}",
  closures: "(x)",
  typescript: "TS",
  proto: "__",
};

export class TopicCard extends BaseComponent {
  constructor(
    topic: ITopic,
    progress: IUserTopicProgress,
    total: number,
    titlesMap?: Map<string, string>,
  ) {
    super({ tag: "article", className: "topic-card" });

    const isLocked = !progress.isUnlocked;

    if (isLocked) {
      this.getNode().classList.add("topic-card--locked");
    }

    if (progress.isCompleted) {
      this.getNode().classList.add("topic-card--completed");
    }

    const percent = Math.round(
      (progress.completedWidgetIds.length / total) * 100,
    );

    this.renderHeader(topic, isLocked);
    this.renderContent(topic, isLocked, titlesMap);
    this.renderProgress(percent, progress.xpEarned, total);
    this.renderFooter(progress, topic);
  }

  private renderHeader(topic: ITopic, isLocked: boolean): void {
    const header = new BaseComponent({
      className: "topic-card__header",
      parent: this,
    });

    const iconContainer = new BaseComponent({
      className: "topic-card__icon-wrapper",
      parent: header,
    });

    if (!isLocked) {
      const color = this.getAccentColor(topic.id);
      iconContainer.getNode().style.setProperty("--icon-accent", color);
      iconContainer
        .getNode()
        .classList.add("topic-card__icon-wrapper--colored");
    }

    new BaseComponent({
      className: "topic-card__icon",
      text: isLocked ? EN.widgets.stats.locked : this.getIconText(topic),
      parent: iconContainer,
    });

    this.renderDifficulty(topic.difficulty, header);
  }

  private renderDifficulty(level: number, parent: BaseComponent): void {
    const container = new BaseComponent({
      className: "topic-card__difficulty",
      parent,
    });

    for (let index = 1; index <= MAX_DIFFICULTY; index++) {
      new BaseComponent({
        className: `topic-card__diff-dot ${index <= level ? "active" : ""}`,
        parent: container,
      });
    }
  }

  private renderContent(
    topic: ITopic,
    isLocked: boolean,
    titlesMap?: Map<string, string>,
  ): void {
    new BaseComponent({
      tag: "h3",
      className: "topic-card__title",
      text: topic.title.en,
      parent: this,
    });

    new BaseComponent({
      tag: "p",
      className: "topic-card__desc",
      text: topic.description.en,
      parent: this,
    });

    if (isLocked && topic.requiredTopicIds.length > 0 && titlesMap) {
      const names = topic.requiredTopicIds
        .map((id) => titlesMap.get(id) ?? id)
        .join(", ");

      new BaseComponent({
        className: "topic-card__requires",
        tag: "span",
        text: `${EN.topic.require}: ${names}`,
        parent: this,
      });
    }
  }

  private renderProgress(percent: number, xp: number, total: number): void {
    const wrapper = new BaseComponent({
      className: "topic-card__progress-wrapper",
      parent: this,
    });

    const stats = new BaseComponent({
      className: "topic-card__stats",
      parent: wrapper,
    });

    new BaseComponent({
      tag: "span",
      className: "topic-card__xp",
      text: EN.widgets.stats.xp_value(xp),
      parent: stats,
    });

    new BaseComponent({
      tag: "span",
      className: "topic-card__percent",
      text: `${percent}%`,
      parent: stats,
    });

    const bar = new BaseComponent({
      className: "topic-card__bar",
      parent: wrapper,
    });

    const fill = new BaseComponent({
      className: "topic-card__fill",
      parent: bar,
    });

    fill.getNode().style.width = `${percent}%`;

    const info = new BaseComponent({
      className: "topic-card__info",
      parent: wrapper,
    });

    new BaseComponent({ tag: "span", text: `Items: ${total}`, parent: info });
  }

  private renderFooter(progress: IUserTopicProgress, topic: ITopic): void {
    const footer = new BaseComponent({
      className: "topic-card__footer",
      parent: this,
    });

    const buttonText = progress.isCompleted
      ? EN.topic.retry
      : progress.completedWidgetIds.length > 0
        ? EN.topic.continue
        : EN.topic.start;

    const button = new Button({
      className: "topic-card__button",
      text: buttonText,
      parent: footer,
    });

    if (progress.isCompleted) {
      button.getNode().classList.add("btn--secondary");
    } else {
      button.getNode().classList.add("btn--primary");
    }

    button.on("click", () => {
      const path = ROUTES.PRACTICE.replace(":topicId", topic.id);
      router.navigate(path);
    });
  }

  private getIconText(topic: ITopic): string {
    return TOPIC_ICONS[topic.id] ?? topic.title.en.slice(0, 2).toUpperCase();
  }

  private getAccentColor(id: string): string {
    const hash = [...id].reduce(
      (accumulator, c) => accumulator + (c.codePointAt(0) || 0),
      0,
    );
    return COLORS[hash % COLORS.length];
  }
}
