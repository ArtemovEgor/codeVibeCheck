import type Page from "@/pages/page";
import BaseComponent from "../base/base-component";
import { NOT_FOUND } from "@/assets/icons";
import { EN } from "@/locale/en";
import "./not-found-content.scss";
import hljs from "highlight.js";
import Link from "../link/link";
import { ROUTES } from "@/constants/routes";

export class NotFoundContent extends BaseComponent implements Page {
  constructor() {
    super({
      tag: "div",
      className: "not-found",
    });

    this.init();
  }

  public init() {
    this.addChildren([this.createBackground(), this.createContent()]);
  }

  private createBackground(): BaseComponent {
    const background = new BaseComponent({
      tag: "div",
      className: "not-found__background",
      attributes: {
        "aria-hidden": "true",
      },
    });

    for (const [side, code] of Object.entries(EN.not_found.code_blocks)) {
      const codeBlock = new BaseComponent({
        tag: "pre",
        className: `not-found__code-block not-found__code-block--${side} hljs language-javascript`,
        text: code,
        parent: background,
      });

      hljs.highlightElement(codeBlock.getNode());
    }

    return background;
  }

  private createIcon(): BaseComponent {
    const icon = new BaseComponent({
      tag: "span",
      className: "not-found__icon",
    });

    icon.getNode().innerHTML = NOT_FOUND;
    return icon;
  }

  private createContent(): BaseComponent {
    const content = new BaseComponent({
      tag: "div",
      className: "not-found__content",
    });

    content.addChildren([
      this.createIcon(),
      this.createTexts(),
      this.createButton(),
    ]);

    return content;
  }

  private createTexts(): BaseComponent {
    const textBlock = new BaseComponent({
      tag: "div",
    });

    new BaseComponent({
      tag: "h2",
      className: "not-found__title",
      text: EN.not_found.header,
      parent: textBlock,
    });

    new BaseComponent({
      tag: "p",
      className: "not-found__description",
      text: EN.not_found.text,
      parent: textBlock,
    });

    return textBlock;
  }

  private createButton(): Link {
    return new Link({
      text: EN.not_found.button_text,
      href: `#${ROUTES.DASHBOARD}`,
      variant: "primary",
    });
  }
}
