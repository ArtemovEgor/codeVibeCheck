import BaseComponent from "@/components/base/base-component";
import {
  WIDGET_TYPES,
  type ILocalizedString,
  type IQuizAnswer,
  type IVerdict,
  type IWidgetStrategy,
  type Widget,
} from "@/types/shared/widget.types";
import "./quiz-strategy.scss";
import { Button } from "@/components/button/button";
import { EN } from "@/locale/en";

export class QuizStrategy implements IWidgetStrategy {
  public type = WIDGET_TYPES.QUIZ;

  private selectedIndex: number | undefined = undefined;
  private submitButton: Button | undefined = undefined;
  private optionButtons: Button[] = [];

  public render(
    widget: Widget,
    onAnswer: (answer: IQuizAnswer) => void,
  ): BaseComponent {
    if (widget.type !== this.type)
      throw new Error(
        `QuizStrategy received wrong widget type: ${widget.type}`,
      );

    // reset variables before each render
    this.selectedIndex = undefined;
    this.optionButtons = [];
    this.submitButton = undefined;

    const container = new BaseComponent({ className: "widget widget--quiz" });

    new BaseComponent({
      tag: "h2",
      className: "widget__question",
      text: widget.payload.question.en,
      parent: container,
    });

    const optionsContainer = new BaseComponent({
      tag: "div",
      className: "widget__options",
      parent: container,
    });

    for (const [index, option] of widget.payload.options.entries()) {
      this.optionButtons.push(
        this.renderOption(index, option, optionsContainer),
      );
    }

    this.submitButton = this.renderSubmitButton(onAnswer, container);

    return container;
  }

  private renderOption(
    index: number,
    option: ILocalizedString,
    parent: BaseComponent,
  ): Button {
    const button = new Button({
      className: "widget__option",
      text: option.en,
      parent: parent,
    });

    button.on("click", () => {
      for (const option of this.optionButtons) {
        option.getNode().classList.remove("widget__option--selected");
      }
      button.getNode().classList.add("widget__option--selected");
      this.selectedIndex = index;
      if (this.submitButton) this.submitButton.setDisabled(false);
    });

    return button;
  }

  private renderSubmitButton(
    onAnswer: (answer: IQuizAnswer) => void,
    parent: BaseComponent,
  ): Button {
    const submitButton = new Button({
      className: "widget__submit",
      text: EN.widgets.submit,
      parent: parent,
    });

    submitButton.setDisabled(true);

    submitButton.on("click", () => {
      const selectedIndex = this.selectedIndex;
      if (selectedIndex === undefined) return;
      submitButton.setDisabled(true);
      onAnswer({ selectedIndex });
    });

    return submitButton;
  }

  public validate(answer: IQuizAnswer, widget: Widget): boolean {
    if (widget.type !== this.type) return false;

    return answer.selectedIndex === widget.payload.correctIndex;
  }

  public showVerdict(verdict: IVerdict, widget: Widget): void {
    if (widget.type !== this.type) return;

    for (const option of this.optionButtons) {
      option.getNode().classList.add("widget__option--disabled");
    }

    this.submitButton?.getNode().classList.add("widget__submit--hidden");

    if (this.selectedIndex !== undefined) {
      this.optionButtons[this.selectedIndex]
        ?.getNode()
        .classList.add(
          verdict.isCorrect
            ? "widget__option--correct"
            : "widget__option--wrong",
        );
    }

    const correctIndex = widget.payload.correctIndex;
    if (!verdict.isCorrect && correctIndex !== undefined) {
      this.optionButtons[correctIndex]
        ?.getNode()
        .classList.add("widget__option--correct");
    }
  }
}
