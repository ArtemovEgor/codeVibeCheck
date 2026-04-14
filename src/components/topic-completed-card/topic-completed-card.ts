import type { IUserTopicProgress } from "@/types/shared/user.types";
import BaseComponent from "../base/base-component";
import { Button } from "../button/button";
import "./topic-completed-card.scss";
import { i18n } from "@/services/localization-service.ts";

export class TopicCompletedCard extends BaseComponent {
  constructor(
    progress: IUserTopicProgress,
    onRetry: () => void,
    onBack: () => void,
  ) {
    super({ className: "topic-completed" });

    new BaseComponent({
      tag: "h2",
      className: "topic-completed__title",
      text: i18n.t().widgets.completed.title,
      parent: this,
    });

    new BaseComponent({
      tag: "p",
      className: "topic-completed__xp",
      text: i18n.t().widgets.completed.xp(progress.xpEarned),
      parent: this,
    });

    const actions = new BaseComponent({
      className: "topic-completed__actions",
      parent: this,
    });

    new Button({
      className: "btn--secondary",
      text: i18n.t().widgets.completed.back,
      parent: actions,
    }).on("click", () => onBack());

    new Button({
      className: "btn--primary",
      text: i18n.t().widgets.completed.retry,
      parent: actions,
    }).on("click", () => onRetry());
  }
}
