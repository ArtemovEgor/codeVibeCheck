import { i18n } from "@/services/localization-service";
import BaseComponent from "../base/base-component";
import type {
  IProgressStatistic,
  ISkillData,
} from "@/types/shared/progress.types";
import "./skill-mastery.scss";

export default class SkillMastery extends BaseComponent {
  constructor(progressData: IProgressStatistic) {
    super({ className: "skill-mastery" });

    this.render(progressData);
  }

  private render(progressData: IProgressStatistic) {
    new BaseComponent({
      tag: "h2",
      className: "skill-mastery__title",
      text: i18n.t().dashboard.components.skills.title,
      parent: this,
    });
    if (progressData.skillsMastery.length > 0) {
      for (const skillData of progressData.skillsMastery) {
        const item = this.createItem(skillData);
        this.addChildren([item]);
      }
    }
  }

  private createItem(data: ISkillData): BaseComponent {
    const item = new BaseComponent({
      className: "skill-mastery__item",
    });

    item.addChildren([
      this.createItemInfo(data),
      this.createItemProgressBar(data),
      this.createSubInfo(data),
    ]);

    return item;
  }

  private createItemInfo(data: ISkillData): BaseComponent {
    const itemInfo = new BaseComponent({
      className: "skill-mastery__info",
    });
    new BaseComponent({
      tag: "span",
      className: "skill-mastery__label",
      text: i18n.t().dashboard.skills_names[data.type],
      parent: itemInfo,
    });

    new BaseComponent({
      tag: "span",
      className: "skill-mastery__value",
      text: `${data.percentage}%`,
      parent: itemInfo,
    });

    return itemInfo;
  }

  private createItemProgressBar(data: ISkillData): BaseComponent {
    const bar = new BaseComponent({
      className: "skill-mastery__progress-wrapper",
    });

    const fill = new BaseComponent({
      className: "skill-mastery__progress-bar",
      parent: bar,
    });

    fill.getNode().style.width = `${data.percentage}%`;

    return bar;
  }

  private createSubInfo(data: ISkillData): BaseComponent {
    return new BaseComponent({
      className: "skill-mastery__sub-info",
      text: `${data.currentXP} / ${data.totalXP}`,
    });
  }
}
