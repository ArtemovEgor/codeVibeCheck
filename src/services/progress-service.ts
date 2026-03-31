import { progressApi } from "@/api/progress.api";
import { widgetsApi } from "@/api/widgets.api";
import { XP_BY_DIFFICULTY } from "@/constants/game";
import {
  SKILL_TYPES,
  type IProgressStatistic,
  type ISkillData,
  type SkillType,
} from "@/types/shared/progress.types";
import type { IUserTopicProgress } from "@/types/shared/user.types";
import {
  WIDGET_TYPES,
  type ITopic,
  type Widget,
} from "@/types/shared/widget.types";

export class ProgressService {
  private topics: ITopic[] = [];
  private widgets: Widget[] = [];
  private progress: IUserTopicProgress[] = [];

  public async getProgressDashboardData(): Promise<IProgressStatistic> {
    [this.topics, this.widgets, this.progress] = await Promise.all([
      widgetsApi.getTopics(),
      widgetsApi.getWidgets(),
      progressApi.getAll(),
    ]);

    const skillsData = await this.calculateSkillProgress(this.progress);

    return { skillsMastery: skillsData };
  }

  private async calculateSkillProgress(
    progress: IUserTopicProgress[],
  ): Promise<ISkillData[]> {
    const statistic: ISkillData[] = [];
    const skillsXP = await this.countSkillsXP(progress);
    const totalXP = await this.countTotalXPBySkill();
    statistic.push(
      this.createStatisticEl(skillsXP, totalXP, SKILL_TYPES.THEORY),
      this.createStatisticEl(skillsXP, totalXP, SKILL_TYPES.CODING),
      this.createStatisticEl(skillsXP, totalXP, SKILL_TYPES.LOGIC),
    );

    return statistic;
  }

  private async countTotalXPBySkill() {
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

  private async countSkillsXP(progress: IUserTopicProgress[]) {
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
      percentage: Math.round((skillsXP[key] / totalXP[key]) * 100) || 0,
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
