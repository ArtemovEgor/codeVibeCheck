import BaseComponent from "@/components/base/base-component";
import { Button } from "@/components/button/button";
import "./language-switcher.scss";
import { i18n } from "@/services/localization-service";
import type { Language } from "@/types/types";

const LANGUAGES = {
  EN: "en",
  RU: "ru",
} as const;

export class LangSwitcher extends BaseComponent {
  private enBtn!: Button;
  private ruBtn!: Button;

  constructor() {
    super({ className: "lang-switcher" });
    this.render();
    this.initEvents();
  }

  private render(): void {
    this.enBtn = new Button({
      text: LANGUAGES.EN,
      variant: "ghost",
      className: "lang-switcher__btn",
      parent: this,
    });

    new BaseComponent({
      tag: "span",
      text: "/",
      className: "lang-switcher__divider",
      parent: this,
    });

    this.ruBtn = new Button({
      text: LANGUAGES.RU,
      variant: "ghost",
      className: "lang-switcher__btn",
      parent: this,
    });
  }

  private initEvents(): void {
    const current = i18n.getLang();
    this.updateActiveButton(current);

    this.enBtn.on("click", () => i18n.setLang(LANGUAGES.EN));
    this.ruBtn.on("click", () => i18n.setLang(LANGUAGES.RU));
  }

  private updateActiveButton(lang: Language): void {
    this.enBtn.toggleClass("lang-switcher__btn--active", lang === LANGUAGES.EN);
    this.ruBtn.toggleClass("lang-switcher__btn--active", lang === LANGUAGES.RU);
  }
}
