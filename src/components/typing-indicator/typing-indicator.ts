import BaseComponent from "../base/base-component";
import "./typing-indicator.scss";

export class TypingIndicator extends BaseComponent {
  constructor(parent?: BaseComponent | HTMLElement) {
    super({
      tag: "div",
      className: "typing-indicator",
      parent,
    });

    this.renderDots();
  }

  private renderDots() {
    for (let index = 0; index < 3; index++) {
      new BaseComponent({
        tag: "span",
        className: "typing-indicator__dot",
        parent: this,
      });
    }
  }
}
