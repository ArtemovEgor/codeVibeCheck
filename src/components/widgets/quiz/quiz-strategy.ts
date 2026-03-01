import BaseComponent from "@/components/base/base-component";
import type {
  IQuizAnswer,
  IWidgetStrategy,
  Widget,
} from "@/types/shared/widget.types";

export class QuizStrategy implements IWidgetStrategy {
  public type = "quiz" as const;

  public render(
    widget: Widget,
    onAnswer: (answer: IQuizAnswer) => void,
  ): BaseComponent {
    if (widget.type !== this.type) return new BaseComponent();

    const container = new BaseComponent({ className: "widget widget--quiz" });

    new BaseComponent({
      tag: "h2",
      className: "widget__question",
      text: widget.payload.question.en,
      parent: container,
    });

    const options = widget.payload.options;

    for (const [index, option] of options.entries()) {
      new BaseComponent({
        tag: "button",
        className: "widget__option",
        text: option.en,
        parent: container,
      }).on("click", () => {
        onAnswer({ selectedIndex: index });
      });
    }

    return container;
  }

  public validate(answer: IQuizAnswer, widget: Widget): boolean {
    if (widget.type !== this.type) return false;

    return answer.selectedIndex === widget.payload.correctIndex;
  }
}
