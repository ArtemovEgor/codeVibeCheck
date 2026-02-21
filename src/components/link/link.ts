import type { ILinkConfig } from "@/types/types";
import BaseComponent from "../base/base-component";
import "../button/button.scss";

export default class Link extends BaseComponent<HTMLAnchorElement> {
  constructor({
    text,
    onClick,
    href,
    variant,
    className = "",
    isExternal = false,
    ...rest
  }: ILinkConfig) {
    const variantClass = variant ? `btn-${variant}` : "";
    super({
      ...rest,
      tag: "a",
      className: `btn ${variantClass} ${className}`.trim(),
      text,
    });

    this.node.href = href;
    if (isExternal) this.node.target = "_blank";
    if (onClick) this.on("click", (event) => onClick(event as MouseEvent));
  }
}
