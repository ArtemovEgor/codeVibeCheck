import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import "./dashboard-page.scss";
import SkillMastery from "@/components/skill-mastery/skill-mastery";
import AIInterviewPerformance from "@/components/ai-interview-performance/ai-interview-performance";
import { progressService } from "@/services/progress-service";
import { profileApi } from "@/api/profile.api";
import type { IProgressStatistic } from "@/types/shared/progress.types";
import type { IUserChatStats } from "@/types/shared";
import { i18n } from "@/services/localization-service";
import type { IUserStats } from "@/types/shared/user.types";

export class DashboardPage extends BaseComponent implements Page {
  private interactSector: BaseComponent | undefined = undefined;
  private learningSector: BaseComponent | undefined = undefined;
  private header: BaseComponent | undefined = undefined;

  constructor() {
    super({ tag: "div", className: "dashboard" });
    void this.init();
  }

  public async init(): Promise<void> {
    this.getNode().replaceChildren();
    this.renderMainLayout();
    const [stats, progressResult, chatStatsResult] = await Promise.allSettled([
      progressService.loadGlobalStats(),
      progressService.getProgressDashboardData(),
      profileApi.getChatStats(),
    ]);

    if (stats.status === "fulfilled") {
       this.renderHeader(stats.value);
    } else {
      console.warn(stats.reason);
    }

    if (progressResult.status === "fulfilled") {
      this.renderLearningSector(progressResult.value);
    } else {
      console.warn(progressResult.reason);
    }

    if (chatStatsResult.status === "fulfilled") {
      this.renderInteractSector(chatStatsResult.value);
    } else {
      console.warn(chatStatsResult.reason);
    }
  }

  private renderMainLayout() {
    this.header = new BaseComponent({
      className: "dashboard__header",
      parent: this,
    });

    const divider = new BaseComponent({
      className: "dashboard__divider",
    });

    this.learningSector = new BaseComponent({
      className: "dashboard__learning-sector",
    });

    this.interactSector = new BaseComponent({
      className: "dashboard__interact-sector",
    });

    new BaseComponent({
      className: "dashboard__columns",
      parent: this,
      children: [this.learningSector, divider, this.interactSector],
    });
  }

  private renderHeader(stats: IUserStats | undefined): void {
    if (!this.header) return;

    const titleWrap = new BaseComponent({
      className: "dashboard__header-titles",
      parent: this.header,
    });

    new BaseComponent({
      tag: "h1",
      className: "dashboard__title",
      text: i18n.t().dashboard.title,
      parent: titleWrap,
    });

    const subtitleContainer = new BaseComponent({
      className: "dashboard__subtitle-container",
      parent: titleWrap,
    });

    new BaseComponent({
      tag: "p",
      className: "dashboard__subtitle",
      text: `${i18n.t().dashboard.welcome}, Alex!`,
      parent: subtitleContainer,
    });

    new BaseComponent({
      tag: "span",
      className: "dashboard__streak-badge",
      text: stats
        ? i18n.t().widgets.stats.streak(stats.streak)
        : i18n.t().widgets.stats.streak(0),
      parent: subtitleContainer,
    });
  }

  private renderLearningSector(
    progressData: IProgressStatistic | undefined,
  ): void {
    if (!this.learningSector || !progressData) return;

    this.learningSector.addChildren([new SkillMastery(progressData).getNode()]);
  }

  private renderInteractSector(chatStats: IUserChatStats): void {
    if (!this.interactSector) return;

    this.interactSector.addChildren([
      new AIInterviewPerformance(chatStats).getNode(),
    ]);
  }
}
