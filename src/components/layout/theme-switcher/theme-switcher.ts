import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import "./theme-switcher.scss";
import { DEFAULT_THEME } from "@/constants/app";
import { storageService } from "@/services/storage-service";
import { STORAGE_KEYS } from "@/constants/storage-keys";

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
    const current = storageService.getStorage(
      STORAGE_KEYS.THEME,
      DEFAULT_THEME,
    ) as Theme;

    this.handleThemeSwitch(current);
    this.lightBtn.on("click", () => this.handleThemeSwitch(THEMES.LIGHT));
    this.darkBtn.on("click", () => this.handleThemeSwitch(THEMES.DARK));
  }

  private handleThemeSwitch(theme: Theme): void {
    this.applyTheme(theme);
    storageService.setStorage(STORAGE_KEYS.THEME, theme);
    this.lightBtn.toggleClass(
      "theme-switcher__btn--active",
      theme === THEMES.LIGHT,
    );
    this.darkBtn.toggleClass(
      "theme-switcher__btn--active",
      theme === THEMES.DARK,
    );
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.dataset.theme = theme;
  }
}
