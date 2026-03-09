import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import type { IVerdict } from "@/types/shared/widget.types";
import "./verdict-card.scss";
import { EN } from "@/locale/en";
import { ICONS } from "@/assets/icons";

export class VerdictCard extends BaseComponent {
  constructor(verdict: IVerdict, onNext: () => void) {
    super({ className: "verdict-card" });
    this.init(verdict, onNext);
  }

  private init(verdict: IVerdict, onNext: () => void) {
    const infoWrapper = this.renderInfoWrapper(verdict);

    if (verdict.xpEarned > 0) {
      new BaseComponent({
        className: "verdict-card__xp",
        text: `+${verdict.xpEarned} XP`,
        parent: infoWrapper,
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
      className: "verdict-card__next btn--primary",
      text: EN.widgets.next,
      parent: this,
    }).on("click", () => onNext());
  }

  private renderInfoWrapper(verdict: IVerdict): BaseComponent {
    const infoWrapper = new BaseComponent({
      className: "verdict-card__info",
      parent: this,
    });

    const classSuffix = verdict.isCorrect ? "correct" : "wrong";

    const statusElement = new BaseComponent({
      className: `verdict-card__status verdict-card__status--${classSuffix}`,
      parent: infoWrapper,
    });

    const iconWrapper = new BaseComponent({
      tag: "span",
      className: "verdict-card__status-icon",
      parent: statusElement,
    });
    iconWrapper.getNode().innerHTML = verdict.isCorrect
      ? ICONS.check
      : ICONS.cross;

    new BaseComponent({
      tag: "span",
      text: verdict.isCorrect
        ? EN.widgets.answer.correct
        : EN.widgets.answer.wrong,
      parent: statusElement,
    });

    return infoWrapper;
  }
}
