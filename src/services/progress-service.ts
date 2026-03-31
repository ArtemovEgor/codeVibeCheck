import { progressApi } from "@/api/progress.api";
import { widgetsApi } from "@/api/widgets.api";
import { XP_BY_DIFFICULTY } from "@/constants/game";
import type { ISkillData } from "@/types/shared/progress.types";
import type { IUserTopicProgress } from "@/types/shared/user.types";
import type { ITopic, Widget } from "@/types/shared/widget.types";

export class ProgressService {
  private topics: ITopic[] = [];
  private progress: IUserTopicProgress[] = [];

  public async getDashboardData() {
    [this.topics, this.progress] = await Promise.all([
      widgetsApi.getTopics(),
      progressApi.getAll(),
    ]);

    this.calculateSkillProgress(this.progress);
  }

  private async calculateSkillProgress(
    progress: IUserTopicProgress[],
  ): Promise<ISkillData[]> {
    const statistic: ISkillData[] = [];
    const skillsXP = await this.countSkillsXP(progress);
    console.log(statistic, skillsXP);

    return [];
  }

  private async countSkillsXP(progress: IUserTopicProgress[]) {
    const skillsXP = {
      theory: 0,
      coding: 0,
      logic: 0,
    };

    for (const p of progress) {
      const completedWidgetIds = p.completedWidgetIds;
      if (completedWidgetIds) {
        for (const widgetId of completedWidgetIds) {
          const widget: Widget = await widgetsApi.getWidgetById(widgetId);
          switch (widget.type) {
            case "quiz": {
              skillsXP.theory += XP_BY_DIFFICULTY[widget.difficulty];
              break;
            }
            case "true-false": {
              skillsXP.logic += XP_BY_DIFFICULTY[widget.difficulty];
              break;
            }
            default: {
              skillsXP.coding += XP_BY_DIFFICULTY[widget.difficulty];
            }
          }
        }
      }
    }

    return skillsXP;
  }
}

export const progressService = new ProgressService();
