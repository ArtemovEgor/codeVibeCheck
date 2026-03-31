import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import "./dashboard-page.scss";
import SkillMastery from "@/components/skill-mastery/skill-mastery";
import { progressService } from "@/services/progress-service";
import type { IProgressStatistic } from "@/types/shared/progress.types";

export class DashboardPage extends BaseComponent implements Page {
  private interactSector: BaseComponent | undefined = undefined;
  private learningSector: BaseComponent | undefined = undefined;
  private header: BaseComponent | undefined = undefined;

  constructor() {
    super({ tag: "div", className: "dashboard" });
    this.init();
  }

  public async init(): Promise<void> {
    this.getNode().replaceChildren();
    this.renderMainLayout();
    this.renderHeader();
    this.renderInteractSector();
    try {
      const progressData = await progressService.getProgressDashboardData();
      this.renderLearningSector(progressData);
    } catch (error) {
      console.warn(error);
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

  private renderInteractSector(): void {
    if (!this.interactSector) return;

    this.interactSector.addChildren([]);
  }
}
