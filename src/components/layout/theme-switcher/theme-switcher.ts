import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import "./theme-switcher.scss";

export class ThemeSwitcher extends BaseComponent {
  private lightBtn!: Button;
  private darkBtn!: Button;

  constructor() {
    super({ className: "theme-switcher" });
    this.render();
    this.initEvents();
  }

  private render(): void {
    this.lightBtn = new Button({
      text: "☀️",
      variant: "ghost",
      className: "theme-switcher__btn",
      parent: this,
    });

    new BaseComponent({
      tag: "span",
      text: "/",
      className: "theme-switcher__divider",
      parent: this,
    });

    this.darkBtn = new Button({
      text: "🌙",
      variant: "ghost",
      className: "theme-switcher__btn",
      parent: this,
    });
  }

  private initEvents(): void {
    const current = localStorage.getItem("app-theme") ?? "dark";
    (current === "light" ? this.lightBtn : this.darkBtn).toggleClass(
      "theme-switcher__btn--active",
      true,
    );

    this.lightBtn.on("click", () =>
      this.handleThemeSwitch("light", this.lightBtn, this.darkBtn),
    );
    this.darkBtn.on("click", () =>
      this.handleThemeSwitch("dark", this.darkBtn, this.lightBtn),
    );
  }

  private handleThemeSwitch(
    theme: "light" | "dark",
    activeButton: Button,
    inactiveButton: Button,
  ): void {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("app-theme", theme);
    activeButton.toggleClass("theme-switcher__btn--active", true);
    inactiveButton.toggleClass("theme-switcher__btn--active", false);
  }
}
