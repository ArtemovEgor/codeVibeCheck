import BaseComponent from "@/components/base/base-component.ts";
import type { IUserTopicProgress } from "@/types/shared/user.types.ts";
import type { Widget } from "@/types/shared/widget.types.ts";

export class PracticeStats extends BaseComponent {
  constructor(progress: IUserTopicProgress | undefined, widgets: Widget[]) {
    super({ className: "practice-stats" });
    this.render(progress, widgets);
  }

  private render(progress: IUserTopicProgress | undefined, widgets: Widget[]) {
    console.log(progress);
    console.log(widgets);
  }
}
