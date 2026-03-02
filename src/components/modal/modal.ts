import BaseComponent from "../base/base-component";
import "./modal.scss";

export default class Modal extends BaseComponent<HTMLDialogElement> {
  protected content: BaseComponent;

  constructor(className = "modal") {
    super({
      tag: "dialog",
      className,
    });

    this.content = new BaseComponent({
      tag: "div",
      className: "modal__content",
      parent: this,
    });

    this.on("click", (event) => {
      if (event.target === this.getNode()) {
        this.close();
      }
    });
  }

  public showModal(): void {
    this.getNode().showModal();
  }

  public close(): void {
    this.getNode().close();
  }

  public destroy(): void {
    this.close();
    super.destroy();
  }
}
