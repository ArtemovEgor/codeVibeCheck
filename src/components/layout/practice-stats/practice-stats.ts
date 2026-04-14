import BaseComponent from "@/components/base/base-component";
import type { IUserStats, IUserTopicProgress } from "@/types/shared/user.types";
import "./practice-stats.scss";
import { i18n } from "@/services/localization-service.ts";

export class PracticeStats extends BaseComponent {
  constructor(
    progress: IUserTopicProgress | undefined,
    userStats: IUserStats | undefined,
  ) {
    super({ className: "practice-stats" });
    this.render(progress, userStats);
  }

  private render(
    progress: IUserTopicProgress | undefined,
    userStats: IUserStats | undefined,
  ) {
    if (progress) this.renderXPBlock(progress);
    new BaseComponent({ className: "practice-stats__divider", parent: this });
    if (userStats) this.renderTotalStats(userStats);
  }

  private renderXPBlock(progress: IUserTopicProgress) {
    const xpEarned = progress?.xpEarned ?? 0;

    const xpBlock = new BaseComponent({
      className: "practice-stats__block",
      parent: this,
    });

    new BaseComponent({
      tag: "span",
      className: "practice-stats__label",
      text: i18n.t().widgets.stats.xp_earned,
      parent: xpBlock,
    });

    new BaseComponent({
      tag: "span",
      className: "practice-stats__value",
      text:
        i18n.t().widgets.stats.xp_icon +
        i18n.t().widgets.stats.xp_value(xpEarned),
      parent: xpBlock,
    });

    return xpBlock;
  }

  private renderTotalStats(stats: IUserStats) {
    const statsBlock = new BaseComponent({
      className: "practice-stats__total",
      parent: this,
    });

    new BaseComponent({
      className: "practice-stats__total-xp",
      text: i18n.t().widgets.stats.total_xp(stats.totalXp),
      parent: statsBlock,
    });

    new BaseComponent({
      className: "practice-stats__total-xp",
      parent: statsBlock,
      text: i18n.t().widgets.stats.completed_topics(stats.completedTopics),
    });

    new BaseComponent({
      className: "practice-stats__streak",
      text: i18n.t().widgets.stats.streak(stats.streak),
      parent: statsBlock,
    });
  }
}
