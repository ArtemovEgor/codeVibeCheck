import { progressApi } from "@/api/progress.api";
import { widgetsApi } from "@/api/widgets.api";
import { XP_BY_DIFFICULTY } from "@/constants/game";
import {
  SKILL_TYPES,
  type ILastActiveTopic,
  type IProgressStatistic,
  type ISkillData,
  type SkillType,
} from "@/types/shared/progress.types";
import type { IUserStats, IUserTopicProgress } from "@/types/shared/user.types";
import {
  WIDGET_TYPES,
  type ITopic,
  type Widget,
} from "@/types/shared/widget.types";

export class ProgressService {
  private topics: ITopic[] = [];
  private widgets: Widget[] = [];
  private progress: IUserTopicProgress[] = [];

  public async getProgressDashboardData(): Promise<
    IProgressStatistic | undefined
  > {
    [this.topics, this.widgets, this.progress] = await Promise.all([
      widgetsApi.getTopics().catch(() => []),
      widgetsApi.getWidgets().catch(() => []),
      progressApi.getAll().catch(() => []),
    ]);

    const skillsData = this.calculateSkillProgress(this.progress);
    const lastActiveTopic = this.findActiveTopic(this.progress);

    return { skillsMastery: skillsData, lastActiveTopic };
  }

  public async loadGlobalStats(): Promise<IUserStats | undefined> {
    try {
      return await progressApi.getUserStats();
    } catch (error) {
      console.error("Stats loading failed", error);
      return undefined;
    }
  }

  private calculateSkillProgress(progress: IUserTopicProgress[]): ISkillData[] {
    const statistic: ISkillData[] = [];
    const skillsXP = this.countSkillsXP(progress);
    const totalXP = this.countTotalXPBySkill();
    statistic.push(
      this.createStatisticEl(skillsXP, totalXP, SKILL_TYPES.THEORY),
      this.createStatisticEl(skillsXP, totalXP, SKILL_TYPES.CODING),
      this.createStatisticEl(skillsXP, totalXP, SKILL_TYPES.LOGIC),
    );

    return statistic;
  }

  private findActiveTopic(
    progress: IUserTopicProgress[],
  ): ILastActiveTopic | undefined {
    let activeProgress = null;

    for (let index = progress.length - 1; index >= 0; index--) {
      if (!progress[index].isCompleted) {
        activeProgress = progress[index];
        break;
      }
    }
    const topic = this.topics.find((t) => t.id === activeProgress?.topicId);
    if (!topic) return undefined;

    return {
      topic: topic ?? ({} as ITopic),
      progress: activeProgress || ({} as IUserTopicProgress),
      totalWidgets: topic ? topic.widgetIds.length : 0,
    };
  }

  private countTotalXPBySkill() {
    const totalXP = {
      theory: 0,
      coding: 0,
      logic: 0,
    };
    if (this.topics.length > 0 && this.widgets.length > 0) {
      for (const widget of this.widgets) {
        this.countXP(totalXP, widget);
      }
    }
    return totalXP;
  }

  private countSkillsXP(progress: IUserTopicProgress[]) {
    const skillsXP = {
      theory: 0,
      coding: 0,
      logic: 0,
    };

    for (const p of progress) {
      const completedWidgetIds = p.completedWidgetIds;
      if (completedWidgetIds.length > 0) {
        for (const widgetId of completedWidgetIds) {
          const widget = this.widgets.find((item) => item.id === widgetId);
          if (widget) this.countXP(skillsXP, widget);
        }
      }
    }

    return skillsXP;
  }

  private createStatisticEl(
    skillsXP: Record<SkillType, number>,
    totalXP: Record<SkillType, number>,
    key: SkillType = SKILL_TYPES.LOGIC,
  ) {
    return {
      type: key,
      currentXP: skillsXP[key],
      totalXP: totalXP[key],
      percentage:
        totalXP[key] > 0 ? Math.round((skillsXP[key] / totalXP[key]) * 100) : 0,
    };
  }

  private countXP(xp: Record<SkillType, number>, widget: Widget): void {
    switch (widget.type) {
      case WIDGET_TYPES.QUIZ: {
        xp.theory += XP_BY_DIFFICULTY[widget.difficulty];
        break;
      }
      case WIDGET_TYPES.TRUE_FALSE: {
        xp.logic += XP_BY_DIFFICULTY[widget.difficulty];
        break;
      }
      default: {
        xp.coding += XP_BY_DIFFICULTY[widget.difficulty];
      }
    }
  }
}

export const progressService = new ProgressService();
