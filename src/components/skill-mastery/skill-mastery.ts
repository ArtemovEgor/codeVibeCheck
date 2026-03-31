import { i18n } from "@/services/localization-service";
import BaseComponent from "../base/base-component";

export default class SkillMastery extends BaseComponent {
  constructor() {
    super({ className: "skill-mastery" });
    this.render();
  }

  private render() {
    new BaseComponent({
      tag: "h2",
      className: "skill-mastery__title",
      text: i18n.t().dashboard.components.skills.title,
      parent: this,
    });
  }
}
