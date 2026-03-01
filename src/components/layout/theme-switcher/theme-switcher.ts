import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import "./theme-switcher.scss";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/constants/app";

type Theme = "light" | "dark";

const THEMES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

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
    const current =
      (localStorage.getItem(THEME_STORAGE_KEY) as Theme) ?? DEFAULT_THEME;

    (current === THEMES.LIGHT ? this.lightBtn : this.darkBtn).toggleClass(
      "theme-switcher__btn--active",
      true,
    );

    this.lightBtn.on("click", () =>
      this.handleThemeSwitch(THEMES.LIGHT, this.lightBtn, this.darkBtn),
    );
    this.darkBtn.on("click", () =>
      this.handleThemeSwitch(THEMES.DARK, this.darkBtn, this.lightBtn),
    );
  }

  private handleThemeSwitch(
    theme: Theme,
    activeButton: Button,
    inactiveButton: Button,
  ): void {
    this.applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    activeButton.toggleClass("theme-switcher__btn--active", true);
    inactiveButton.toggleClass("theme-switcher__btn--active", false);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.dataset.theme = theme;
  }
}
