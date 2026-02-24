import BaseComponent from "@/components/base/base-component";

export class Sidebar extends BaseComponent {
  constructor() {
    super({ tag: "aside", className: "app-layout__sidebar" });
  }
}
