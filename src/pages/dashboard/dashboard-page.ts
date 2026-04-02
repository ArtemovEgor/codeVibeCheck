import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import "./dashboard-page.scss";
import SkillMastery from "@/components/skill-mastery/skill-mastery";
import AIInterviewPerformance from "@/components/ai-interview-performance/ai-interview-performance";
import { progressService } from "@/services/progress-service";
import { profileApi } from "@/api/profile.api";
import type { IProgressStatistic } from "@/types/shared/progress.types";
import type { IUserChatStats } from "@/types/shared";

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
    this.renderHeader();

    const [progressResult, chatStatsResult] = await Promise.allSettled([
      progressService.getProgressDashboardData(),
      profileApi.getChatStats(),
    ]);

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

  private renderHeader(): void {
    if (!this.header) return;

    this.header.addChildren([]);
  }

  private renderLearningSector(progressData: IProgressStatistic): void {
    if (!this.learningSector) return;

    this.learningSector.addChildren([new SkillMastery(progressData).getNode()]);
  }

  private renderInteractSector(chatStats: IUserChatStats): void {
    if (!this.interactSector) return;

    this.interactSector.addChildren([
      new AIInterviewPerformance(chatStats).getNode(),
    ]);
  }
}
