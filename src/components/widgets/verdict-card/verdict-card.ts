import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import type { IVerdict } from "@/types/shared/widget.types";
import "./verdict-card.scss";
import { EN } from "@/locale/en";

export class VerdictCard extends BaseComponent {
  constructor(verdict: IVerdict, onNext: () => void) {
    super({ className: "verdict-card" });

    const classSuffix = verdict.isCorrect ? "correct" : "wrong";

    new BaseComponent({
      tag: "div",
      className: `verdict-card__status verdict-card__status--${classSuffix}`,
      text: verdict.isCorrect
        ? EN.widgets.answer.correct
        : EN.widgets.answer.wrong,
      parent: this,
    });

    if (verdict.xpEarned > 0) {
      new BaseComponent({
        tag: "div",
        className: "verdict-card__xp",
        text: `+${verdict.xpEarned} XP`,
        parent: this,
      });
    }

    if (verdict.explanation) {
      new BaseComponent({
        tag: "p",
        className: "verdict-card__explanation",
        text: verdict.explanation.en,
        parent: this,
      });
    }

    new Button({
      className: "verdict-card__next",
      text: EN.widgets.next,
      parent: this,
    }).on("click", () => onNext());
  }
}
