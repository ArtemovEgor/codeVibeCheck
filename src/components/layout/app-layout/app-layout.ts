import BaseComponent from "@/components/base/base-component";
import { Sidebar } from "../sidebar/sidebar";
import "./app-layout.scss";

export class AppLayout extends BaseComponent {
  private contentArea: BaseComponent;

  constructor() {
    super({ tag: "div", className: "app-layout" });

    this.contentArea = new BaseComponent({
      tag: "main",
      className: "app-layout__content",
    });

    this.addChildren([new Sidebar(), this.contentArea]);
  }

  public setPage(page: BaseComponent): void {
    this.contentArea.getNode().replaceChildren(page.getNode());
  }
}
