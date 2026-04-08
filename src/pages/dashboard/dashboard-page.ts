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
import type { IUser, IUserStats } from "@/types/shared/user.types";
import { authApi } from "@/api/auth.api";
import { TopicCard } from "@/components/topic-card/topic-card";
import { Button } from "@/components/button/button";
import { ROUTES } from "@/constants/routes";
import { router } from "@/router/router";
import { ICONS } from "@/assets/icons";

export class DashboardPage extends BaseComponent implements Page {
  private interactSector: BaseComponent | undefined = undefined;
  private learningSector: BaseComponent | undefined = undefined;
  private header: BaseComponent | undefined = undefined;

  constructor() {
    super({ className: "dashboard" });
    void this.init();
  }

  public async init(): Promise<void> {
    this.getNode().replaceChildren();
    this.renderMainLayout();
    const [stats, progressResult, chatStatsResult, currentUser] =
      await Promise.allSettled([
        progressService.loadGlobalStats(),
        progressService.getProgressDashboardData(),
        profileApi.getChatStats(),
        this.loadUser(),
      ]);

    if (stats.status === "fulfilled" && currentUser.status === "fulfilled") {
      this.renderHeader(stats.value, currentUser.value);
    } else {
      if (stats.status === "rejected")
        console.warn("Stats error:", stats.reason);
      if (currentUser.status === "rejected")
        console.warn("User error:", currentUser.reason);
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

  private renderHeader(
    stats: IUserStats | undefined,
    user: IUser | undefined,
  ): void {
    if (!this.header) return;

    this.header.addChildren([this.createHeaderTitle(stats, user)]);
  }

  private renderLearningSector(
    progressData: IProgressStatistic | undefined,
  ): void {
    if (!this.learningSector || !progressData) return;

    this.learningSector.addChildren([
      this.createResumeSector(progressData),
      new SkillMastery(progressData).getNode(),
    ]);
  }

  private renderInteractSector(chatStats: IUserChatStats): void {
    if (!this.interactSector) return;

    this.interactSector.addChildren([
      new AIInterviewPerformance(chatStats).getNode(),
    ]);
  }

  private createResumeSector(
    progressData: IProgressStatistic | undefined,
  ): BaseComponent {
    const resumeComponent = new BaseComponent({
      className: "dashboard__resume",
    });

    if (progressData && progressData.lastActiveTopic) {
      const card = new TopicCard(
        progressData.lastActiveTopic.topic,
        progressData.lastActiveTopic.progress,
        progressData.lastActiveTopic.totalWidgets,
      );
      resumeComponent.addChildren([card]);
    } else {
      const emptyContent = new BaseComponent({
        className: "dashboard__resume-empty",
        parent: resumeComponent,
      });

      new BaseComponent({
        tag: "p",
        className: "dashboard__resume-text",
        text: i18n.t().dashboard.components.resume.empty_text,
        parent: emptyContent,
      });

      new Button({
        text: i18n.t().dashboard.components.resume.button,
        className: "btn--primary",
        parent: emptyContent,
        onClick: () => router.navigate(ROUTES.LIBRARY),
      });
    }

    return resumeComponent;
  }

  private createHeaderTitle(
    stats: IUserStats | undefined,
    user: IUser | undefined,
  ): BaseComponent {
    const titleWrap = new BaseComponent({
      className: "dashboard__header-titles",
    });

    this.renderHeaderSubtitle(titleWrap, user?.name, stats?.streak);
    this.renderScoreBadge(titleWrap, user?.totalScore);

    return titleWrap;
  }

  private renderHeaderSubtitle(
    parent: BaseComponent,
    name?: string,
    streak = 0,
  ): void {
    const subtitleContainer = new BaseComponent({
      className: "dashboard__subtitle-container",
      parent,
    });

    new BaseComponent({
      tag: "p",
      className: "dashboard__subtitle",
      text: `${i18n.t().dashboard.welcome}, ${name ?? i18n.t().default_user}!`,
      parent: subtitleContainer,
    });

    new BaseComponent({
      tag: "span",
      className: "dashboard__streak-badge",
      text: i18n.t().widgets.stats.streak(streak),
      parent: subtitleContainer,
    });
  }

  private renderScoreBadge(parent: BaseComponent, score?: number): void {
    if (score !== undefined) {
      const badge = new BaseComponent({
        tag: "div",
        className: "dashboard__score-badge",
        parent,
      });

      const icon = new BaseComponent({
        tag: "span",
        className: "dashboard__score-icon",
        parent: badge,
      });

      icon.getNode().innerHTML = ICONS.star;

      new BaseComponent({
        tag: "span",
        className: "dashboard__score-value",
        text: i18n.t().widgets.stats.xp_value(score),
        parent: badge,
      });
    }
  }

  private async loadUser(): Promise<IUser | undefined> {
    try {
      return await authApi.getCurrentUser();
    } catch {
      return undefined;
    }
  }
}
