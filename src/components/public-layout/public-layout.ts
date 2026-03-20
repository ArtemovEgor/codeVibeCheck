import BaseComponent from "../base/base-component";
import { Header } from "../layout/header/header";
import "./public-layout.scss";

export class PublicLayout extends BaseComponent {
  private header: Header;
  private contentArea: BaseComponent;

  constructor() {
    super({ tag: "div", className: "public-layout" });

    this.header = new Header();

    this.contentArea = new BaseComponent({
      tag: "main",
      className: "public-layout__content",
    });

    this.addChildren([this.header, this.contentArea]);
  }

  public setPage(page: BaseComponent): void {
    this.contentArea.getNode().replaceChildren(page.getNode());
  }
}
