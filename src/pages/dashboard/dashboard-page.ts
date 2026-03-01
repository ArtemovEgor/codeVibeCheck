import BaseComponent from "@/components/base/base-component";
import type Page from "../page";

export class DashboardPage extends BaseComponent implements Page {
  constructor() {
    super({ tag: "div", className: "dashboard" });

    this.init();
  }

  public init(): void {
    this.addChildren([]);
  }
}
