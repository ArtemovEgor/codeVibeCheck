import { i18n } from "@/services/localization-service";
import BaseComponent from "../base/base-component";
import type { IProgressStatistic } from "@/types/shared/progress.types";

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
  }
}
