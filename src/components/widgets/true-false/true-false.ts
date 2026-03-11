import BaseComponent from "@/components/base/base-component";
import {
  WIDGET_TYPES,
  type ITrueFalseAnswer,
  type IVerdict,
  type IWidgetStrategy,
  type Widget,
} from "@/types/shared/widget.types";

export class TrueFalseStrategy implements IWidgetStrategy {
  public type = WIDGET_TYPES.TRUE_FALSE;

  public render(
    widget: Widget,
    onAnswer: (answer: ITrueFalseAnswer) => void,
  ): BaseComponent {
    if (widget.type !== this.type)
      throw new Error(
        `TrueFalseStrategy received wrong widget type: ${widget.type}`,
      );

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

  public showVerdict(verdict: IVerdict, widget: Widget): void {
    // TODO: implement showVerdict logic
    console.log(verdict, widget);
    throw new Error("Method not implemented.");
  }
}
