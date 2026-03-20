import BaseComponent from "@/components/base/base-component.ts";
import type {
  IUserStats,
  IUserTopicProgress,
} from "@/types/shared/user.types.ts";
import "./practice-stats.scss";
import { EN } from "@/locale/en";

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
      text: EN.widgets.stats.xp_earned,
      parent: xpBlock,
    });

    new BaseComponent({
      tag: "span",
      className: "practice-stats__value",
      text: EN.widgets.stats.xp_value(xpEarned),
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
      tag: "div",
      className: "practice-stats__total-xp",
      text: EN.widgets.stats.total_xp(stats.totalXp),
      parent: statsBlock,
    });

    if (stats.streak > 0) {
      new BaseComponent({
        tag: "div",
        className: "practice-stats__streak",
        text: EN.widgets.stats.streak(stats.streak),
        parent: statsBlock,
      });
    }
  }
}
