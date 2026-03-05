import BaseComponent from "@/components/base/base-component";
import {
  WIDGET_TYPES,
  type IQuizAnswer,
  type IWidgetStrategy,
  type Widget,
} from "@/types/shared/widget.types";

export class QuizStrategy implements IWidgetStrategy {
  public type = WIDGET_TYPES.QUIZ;

  public render(
    widget: Widget,
    onAnswer: (answer: IQuizAnswer) => void,
  ): BaseComponent {
    if (widget.type !== this.type)
      throw new Error(
        `QuizStrategy received wrong widget type: ${widget.type}`,
      );

    const container = new BaseComponent({ className: "widget widget--quiz" });
    // TODO: implement render logic
    void onAnswer;

    return container;
  }

  public validate(answer: IQuizAnswer, widget: Widget): boolean {
    if (widget.type !== this.type) return false;

    return answer.selectedIndex === widget.payload.correctIndex;
  }
}
