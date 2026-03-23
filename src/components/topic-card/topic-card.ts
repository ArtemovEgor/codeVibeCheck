import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import type { ITopic } from "@/types/shared/widget.types";
import type { IUserTopicProgress } from "@/types/shared/user.types";
import { router } from "@/router/router";
import { ROUTES } from "@/constants/routes";
import { EN } from "@/locale/en";
import "./topic-card.scss";

const MAX_DIFFICULTY = 3;

export class TopicCard extends BaseComponent {
  constructor(
    topic: ITopic,
    progress: IUserTopicProgress,
    implementedTotal: number,
  ) {
    super({ className: "topic-card" });
    this.render(topic, progress, implementedTotal);
  }

  private render(
    topic: ITopic,
    progress: IUserTopicProgress,
    implementedTotal: number,
  ): void {
    const isLocked = !progress.isUnlocked;

    if (isLocked) {
      this.getNode().classList.add("topic-card--locked");
    }
    if (progress.isCompleted) {
      this.getNode().classList.add("topic-card--completed");
    }

    const header = new BaseComponent({
      className: "topic-card__header",
      parent: this,
    });

    new BaseComponent({
      tag: "h3",
      className: "topic-card__title",
      text: topic.title.en,
      parent: header,
    });

    this.renderDifficulty(topic.difficulty, header);

    const info = new BaseComponent({
      className: "topic-card__info",
      parent: this,
    });

    new BaseComponent({
      tag: "span",
      className: "topic-card__xp",
      text: EN.widgets.stats.xp_value(progress.xpEarned),
      parent: info,
    });

    const footer = new BaseComponent({
      className: "topic-card__footer",
      parent: this,
    });

    this.renderProgressBar(progress, footer, implementedTotal);
    this.renderButton(topic, progress, footer);
  }

  private renderDifficulty(difficulty: number, parent: BaseComponent): void {
    const wrapper = new BaseComponent({
      className: "topic-card__difficulty",
      parent: parent,
    });

    for (let index = 1; index <= MAX_DIFFICULTY; index++) {
      new BaseComponent({
        tag: "span",
        className: `topic-card__dot${index <= difficulty ? " topic-card__dot--active" : ""}`,
        parent: wrapper,
      });
    }
  }

  private renderProgressBar(
    progress: IUserTopicProgress,
    parent: BaseComponent,
    total: number,
  ): void {
    const completed = progress.completedWidgetIds.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const track = new BaseComponent({
      className: "topic-card__progress-track",
      parent: parent,
    });

    new BaseComponent({
      className: "topic-card__progress-fill",
      parent: track,
    }).getNode().style.width = `${percent}%`;

    new BaseComponent({
      tag: "span",
      className: "topic-card__progress-text",
      text: `${completed} / ${total}`,
      parent: parent,
    });
  }

  private renderButton(
    topic: ITopic,
    progress: IUserTopicProgress,
    parent: BaseComponent,
  ): void {
    if (!progress.isUnlocked) {
      new BaseComponent({
        tag: "span",
        className: "topic-card__locked",
        text: EN.widgets.stats.locked,
        parent: parent,
      });
      return;
    }

    const buttonText = progress.isCompleted
      ? EN.library.retry
      : progress.completedWidgetIds.length > 0
        ? EN.library.continue
        : EN.library.start;

    const button = new Button({
      className: "topic-card__button",
      text: buttonText,
      parent: parent,
    });

    if (progress.isCompleted) {
      button.getNode().classList.add("btn--secondary");
    } else {
      button.getNode().classList.add("btn--primary");
    }

    button.on("click", () => {
      router.navigate(`${ROUTES.PRACTICE}/${topic.id}`);
    });
  }
}
