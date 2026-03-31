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
    console.log(progressData);
    if (progressData.skillsMastery.length > 0) {
      for (const skillData of progressData.skillsMastery) {
        const item = this.renderItem(skillData);
        this.addChildren([item]);
      }
    }
  }

  private renderItem(data: ISkillData): BaseComponent {
    const item = new BaseComponent({
      className: "skill-mastery__item",
      parent: this,
    });

    this.renderItemInfo(data, item);
    this.renderItemProgressBar(data, item);
    this.renderSubInfo(data, item);

    return item;
  }

  private renderItemInfo(
    data: ISkillData,
    parent: BaseComponent,
  ): BaseComponent {
    const itemInfo = new BaseComponent({
      className: "skill-mastery__info",
      parent: parent,
    });
    new BaseComponent({
      tag: "span",
      className: "skill-mastery__label",
      text: data.type,
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

  private renderItemProgressBar(
    data: ISkillData,
    parent: BaseComponent,
  ): BaseComponent {
    const bar = new BaseComponent({
      className: "skill-mastery__progress-wrapper",
      parent: parent,
    });

    const fill = new BaseComponent({
      className: "skill-mastery__progress-bar",
      parent: bar,
    });

    fill.getNode().style.width = `${data.percentage}%`;

    return bar;
  }

  private renderSubInfo(
    data: ISkillData,
    parent: BaseComponent,
  ): BaseComponent {
    return new BaseComponent({
      className: "skill-mastery__sub-info",
      text: `${data.currentXP} / ${data.totalXP}`,
      parent: parent,
    });
  }
}
