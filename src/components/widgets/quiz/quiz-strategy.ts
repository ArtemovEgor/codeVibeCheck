import BaseComponent from "@/components/base/base-component";
import type {
  IQuizAnswer,
  IWidgetStrategy,
  Widget,
} from "@/types/shared/widget.types";

export class QuizStrategy implements IWidgetStrategy<Widget, IQuizAnswer> {
  public type = "quiz" as const;

  public render(
    widget: Widget,
    // onAnswer: (answer: IQuizAnswer) => void,
  ): BaseComponent {
    if (widget.type !== this.type) return new BaseComponent();

    const container = new BaseComponent({ className: "widget widget--quiz" });
    return container;
  }

  public validate(answer: IQuizAnswer, widget: Widget) {
    return answer.selectedIndex === widget.payload.answer;
  }
}
