import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import { i18n } from "@/services/localization-service";
import {
  WIDGET_TYPES,
  type ICodeOrderingAnswer,
  type ICodeOrderingPayload,
  type IVerdict,
  type IWidgetStrategy,
  type Widget,
  type WidgetAnswerValue,
} from "@/types/shared/widget.types";
import "./code-ordering-strategy.scss";

export class CodeOrderingStrategy implements IWidgetStrategy {
  public type = WIDGET_TYPES.CODE_ORDERING;

  private currentOrder: number[] = [];
  private submitButton: Button | undefined = undefined;
  private lineElements: BaseComponent[] = [];

  public render(
    widget: Widget,
    onAnswer: (answer: ICodeOrderingAnswer) => void,
  ): BaseComponent {
    if (widget.type !== this.type)
      throw new Error(
        `CodeOrderingStrategy received wrong widget type: ${widget.type}`,
      );

    this.submitButton = undefined;
    this.lineElements = [];

    const payload = widget.payload as ICodeOrderingPayload;

    this.currentOrder = payload.lines.map((_, index) => index);

    const container = new BaseComponent({
      className: "widget widget--code-ordering",
    });

    new BaseComponent({
      tag: "h2",
      className: "widget__question",
      text: i18n.getLocalizedField(payload.description),
      parent: container,
    });

    const linesContainer = new BaseComponent({
      className: "widget__lines",
      parent: container,
    });

    this.renderLines(payload, linesContainer);

    this.submitButton = new Button({
      className: "widget__submit",
      text: i18n.t().widgets.submit,
      parent: container,
    });

    this.submitButton.on("click", () => {
      this.submitButton?.setDisabled(true);
      onAnswer({ order: [...this.currentOrder] });
    });

    return container;
  }

  private renderLines(
    payload: ICodeOrderingPayload,
    container: BaseComponent,
  ): void {
    this.lineElements = [];
    container.getNode().replaceChildren();

    for (const [position, lineIndex] of this.currentOrder.entries()) {
      const lineWrapper = new BaseComponent({
        className: "widget__line",
        parent: container,
      });

      const upButton = new Button({
        className: "widget__line-btn",
        text: "↑",
        parent: lineWrapper,
      });
      upButton.setDisabled(position === 0);
      upButton.on("click", () => {
        this.moveLine(position, position - 1, payload, container);
      });

      new BaseComponent({
        tag: "code",
        className: "widget__line-code",
        text: payload.lines[lineIndex],
        parent: lineWrapper,
      });

      const downButton = new Button({
        className: "widget__line-btn",
        text: "↓",
        parent: lineWrapper,
      });
      downButton.setDisabled(position === this.currentOrder.length - 1);
      downButton.on("click", () => {
        this.moveLine(position, position + 1, payload, container);
      });

      this.lineElements.push(lineWrapper);
    }
  }

  private moveLine(
    from: number,
    to: number,
    payload: ICodeOrderingPayload,
    container: BaseComponent,
  ): void {
    [this.currentOrder[from], this.currentOrder[to]] = [
      this.currentOrder[to],
      this.currentOrder[from],
    ];
    this.renderLines(payload, container);
  }

  public validate(answer: ICodeOrderingAnswer, widget: Widget): boolean {
    if (widget.type !== this.type) return false;
    const payload = widget.payload as ICodeOrderingPayload;
    if (!payload.correctOrder) return false;
    return (
      JSON.stringify(answer.order) === JSON.stringify(payload.correctOrder)
    );
  }

  public showVerdict(verdict: IVerdict, widget: Widget): void {
    if (widget.type !== this.type) return;

    this.submitButton?.getNode().classList.add("widget__submit--hidden");

    for (const line of this.lineElements) {
      for (const button of line.getNode().querySelectorAll("button")) {
        (button as HTMLButtonElement).disabled = true;
      }
    }

    const correctOrder = verdict.correctAnswer as number[] | undefined;
    for (const [position, lineElement] of this.lineElements.entries()) {
      const isCorrect = correctOrder
        ? this.currentOrder[position] === correctOrder[position]
        : verdict.isCorrect;

      lineElement
        .getNode()
        .classList.add(
          isCorrect ? "widget__line--correct" : "widget__line--wrong",
        );
    }
  }

  public getCorrectValue(widget: Widget): WidgetAnswerValue {
    const payload = widget.payload as ICodeOrderingPayload;
    return payload.correctOrder;
  }
}
