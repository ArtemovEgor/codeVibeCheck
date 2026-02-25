import BaseComponent from "../base/base-component";

export default class Modal extends BaseComponent<HTMLDialogElement> {
  constructor(className = "modal") {
    super({
      tag: "dialog",
      className,
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
