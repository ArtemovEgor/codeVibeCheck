import type { Language } from "@/types/types";
import { storageService } from "./storage-service";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { EN } from "@/locale/en";
import { RU } from "@/locale/ru";

const DEFAULT_LANG: Language = "en";
const DICTIONARIES: Record<Language, typeof EN> = { en: EN, ru: RU };

class LocalizationService {
  private currentLang: Language = storageService.getStorage<Language>(
    STORAGE_KEYS.LANG,
    DEFAULT_LANG,
  );

  public setLang(lang: Language): void {
    storageService.setStorage(STORAGE_KEYS.LANG, lang);
    this.currentLang = lang;
    location.reload();
  }

  public getLang(): Language {
    return this.currentLang;
  }

  public t(): typeof EN {
    return DICTIONARIES[this.getLang()];
  }

  public getLocalizedField<T extends Record<Language, string>>(
    field: T,
  ): string {
    return field[this.getLang()];
  }
}

export const i18n = new LocalizationService();
