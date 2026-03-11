import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import { EN } from "@/locale/en";
import {
  WIDGET_TYPES,
  type ILocalizedString,
  type ITrueFalseAnswer,
  type IVerdict,
  type IWidgetStrategy,
  type Widget,
} from "@/types/shared/widget.types";
import "./true-false.scss";

const OPTIONS = [
  { value: true, label: { en: "True", ru: "Верно" } },
  { value: false, label: { en: "False", ru: "Неверно" } },
] as const;

export class TrueFalseStrategy implements IWidgetStrategy {
  public type = WIDGET_TYPES.TRUE_FALSE;

  private selectedValue: boolean | undefined = undefined;
  private submitButton: Button | undefined = undefined;
  private optionButtons: Button[] = [];

  public render(
    widget: Widget,
    onAnswer: (answer: ITrueFalseAnswer) => void,
  ): BaseComponent {
    if (widget.type !== this.type)
      throw new Error(
        `TrueFalseStrategy received wrong widget type: ${widget.type}`,
      );

    // reset variables before each render
    this.selectedValue = undefined;
    this.optionButtons = [];
    this.submitButton = undefined;
    const container = new BaseComponent({
      className: "widget widget--true-false",
    });

    new BaseComponent({
      tag: "h2",
      className: "widget__question",
      text: widget.payload.statement.en,
      parent: container,
    });

    const optionsContainer = new BaseComponent({
      tag: "div",
      className: "widget__options",
      parent: container,
    });

    for (const option of OPTIONS) {
      this.optionButtons.push(
        this.renderOption(option.value, option.label, optionsContainer),
      );
    }

    this.submitButton = this.renderSubmitButton(onAnswer, container);

    return container;
  }

  private renderOption(
    index: boolean,
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
      this.selectedValue = index;
      if (this.submitButton) this.submitButton.setDisabled(false);
    });

    return button;
  }

  private renderSubmitButton(
    onAnswer: (answer: ITrueFalseAnswer) => void,
    parent: BaseComponent,
  ): Button {
    const submitButton = new Button({
      className: "widget__submit",
      text: EN.widgets.submit,
      parent: parent,
    });

    submitButton.setDisabled(true);

    submitButton.on("click", () => {
      const selectedValue = this.selectedValue;
      if (selectedValue === undefined) return;
      submitButton.setDisabled(true);
      onAnswer({ value: selectedValue });
    });

    return submitButton;
  }

  public validate(answer: ITrueFalseAnswer, widget: Widget): boolean {
    if (widget.type !== this.type) return false;

    return answer.value === widget.payload.correctValue;
  }

  public showVerdict(verdict: IVerdict, widget: Widget): void {
    if (widget.type !== this.type) return;

    for (const option of this.optionButtons) {
      option.getNode().classList.add("widget__option--disabled");
    }

    this.submitButton?.getNode().classList.add("widget__submit--hidden");

    if (this.selectedValue !== undefined) {
      const correctIndex = OPTIONS.findIndex(
        (o) => o.value === this.selectedValue,
      );
      this.optionButtons[correctIndex]
        ?.getNode()
        .classList.add(
          verdict.isCorrect
            ? "widget__option--correct"
            : "widget__option--wrong",
        );
    }

    const correctValue = widget.payload.correctValue;
    if (!verdict.isCorrect && correctValue !== undefined) {
      const correctIndex = OPTIONS.findIndex((o) => o.value === correctValue);
      if (correctIndex !== -1) {
        this.optionButtons[correctIndex]
          ?.getNode()
          .classList.add("widget__option--correct");
      }
    }
  }
}
