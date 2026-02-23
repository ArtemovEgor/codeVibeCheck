import type { IClickableConfig } from "@/types/types";
import BaseComponent from "../base/base-component";
import "./button.scss";

export class Button extends BaseComponent<HTMLButtonElement> {
  constructor({
    text,
    onClick,
    variant = "primary",
    className = "",
    ...rest
  }: IClickableConfig) {
    super({
      ...rest,
      tag: "button",
      className: `btn btn-${variant} ${className}`.trim(),
      text,
    });

    if (onClick) this.on("click", (event) => onClick(event as MouseEvent));
  }

  public setDisabled(disabled: boolean): this {
    this.getNode().disabled = disabled;
    return this;
  }
}
