import BaseComponent from "@/components/base/base-component";
import type {
  ITrueFalseAnswer,
  IWidgetStrategy,
  Widget,
} from "@/types/shared/widget.types";

export class TrueFalseStrategy implements IWidgetStrategy {
  public type = "true-false" as const;

  public render(
    widget: Widget,
    onAnswer: (answer: ITrueFalseAnswer) => void,
  ): BaseComponent {
    if (widget.type !== this.type) return new BaseComponent();

    const container = new BaseComponent({
      className: "widget widget--true-false",
    });
    // TODO: implement render logic
    void onAnswer;

    return container;
  }

  public validate(answer: ITrueFalseAnswer, widget: Widget): boolean {
    if (widget.type !== this.type) return false;

    return answer.value === widget.payload.correctValue;
  }
}
