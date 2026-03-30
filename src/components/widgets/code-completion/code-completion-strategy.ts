import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import { i18n } from "@/services/localization-service";
import {
  WIDGET_TYPES,
  type ICodeCompletionAnswer,
  type ICodeCompletionPayload,
  type IVerdict,
  type IWidgetStrategy,
  type Widget,
  type WidgetAnswerValue,
} from "@/types/shared/widget.types";
import "./code-completion-strategy.scss";

const BLANK = "___";

export class CodeCompletionStrategy implements IWidgetStrategy {
  public type = WIDGET_TYPES.CODE_COMPLETION;

  private inputs: HTMLInputElement[] = [];
  private submitButton: Button | undefined = undefined;

  public render(
    widget: Widget,
    onAnswer: (answer: ICodeCompletionAnswer) => void,
  ): BaseComponent {
    if (widget.type !== this.type)
      throw new Error(
        `CodeCompletionStrategy received wrong widget type: ${widget.type}`,
      );

    this.inputs = [];
    this.submitButton = undefined;

    const payload = widget.payload as ICodeCompletionPayload;

    const container = new BaseComponent({
      className: "widget widget--code-completion",
    });

    new BaseComponent({
      tag: "h2",
      className: "widget__question",
      text: i18n.t().widgets.code_completion.header,
      parent: container,
    });

    this.renderCode(payload, container);
    this.renderHints(payload, container);
    this.submitButton = this.renderSubmitButton(onAnswer, container);

    return container;
  }

  private renderCode(
    payload: ICodeCompletionPayload,
    parent: BaseComponent,
  ): void {
    const parts = payload.code.split(BLANK);

    const pre = new BaseComponent({
      tag: "pre",
      className: "widget__code",
      parent,
    });

    for (const [index, part] of parts.entries()) {
      pre.getNode().append(document.createTextNode(part));

      if (index < parts.length - 1) {
        const correctValue =
          payload.correctValues && payload.correctValues[index]
            ? payload.correctValues[index]
            : "";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "widget__blank";
        input.style.width = `${correctValue.length + 2}ch`;
        input.spellcheck = false;

        input.addEventListener("input", () => {
          this.submitButton?.setDisabled(!this.allFilled());
        });

        this.inputs.push(input);
        pre.addChildren([input]);
      }
    }
  }

  private renderHints(
    payload: ICodeCompletionPayload,
    parent: BaseComponent,
  ): void {
    if (!payload.hints?.length) return;

    const hintsContainer = new BaseComponent({
      className: "widget__hints",
      parent,
    });

    for (const hint of payload.hints) {
      new BaseComponent({
        tag: "p",
        className: "widget__hint",
        text: `💡 ${i18n.getLocalizedField(hint)}`,
        parent: hintsContainer,
      });
    }
  }

  private renderSubmitButton(
    onAnswer: (answer: ICodeCompletionAnswer) => void,
    parent: BaseComponent,
  ): Button {
    const submitButton = new Button({
      className: "widget__submit",
      text: i18n.t().widgets.submit,
      parent,
    });

    submitButton.setDisabled(true);

    submitButton.on("click", () => {
      const values = this.inputs.map((input) => input.value.trim());
      submitButton.setDisabled(true);
      onAnswer({ values });
    });

    return submitButton;
  }

  private allFilled(): boolean {
    return this.inputs.every((input) => input.value.trim().length > 0);
  }

  public validate(answer: ICodeCompletionAnswer, widget: Widget): boolean {
    if (widget.type !== this.type) return false;

    const payload = widget.payload as ICodeCompletionPayload;
    if (payload.correctValues === undefined) return false;

    return answer.values.every(
      (value, index) =>
        value.toLowerCase() === payload.correctValues?.[index]?.toLowerCase(),
    );
  }

  public showVerdict(verdict: IVerdict, widget: Widget): void {
    if (widget.type !== this.type) return;

    this.submitButton?.getNode().classList.add("widget__submit--hidden");

    const correctValues = verdict.correctAnswer as string[] | undefined;

    for (const [index, input] of this.inputs.entries()) {
      input.disabled = true;

      if (verdict.isCorrect) {
        input.classList.add("widget__blank--correct");
        return;
      }

      const correctValue = correctValues?.[index];
      const isCorrect =
        correctValue !== undefined &&
        input.value.trim().toLowerCase() === correctValue.toLowerCase();

      input.classList.add(
        isCorrect ? "widget__blank--correct" : "widget__blank--wrong",
      );

      if (!isCorrect && correctValue) {
        const hint = document.createElement("span");
        hint.className = "widget__blank-answer";
        hint.textContent = correctValue;
        input.after(hint);
      }
    }
  }

  public getCorrectValue(widget: Widget): WidgetAnswerValue {
    const payload = widget.payload as ICodeCompletionPayload;
    return payload.correctValues;
  }
}
