import type { Language } from "@/types/types";
import { storageService } from "./storage-service";
import { STORAGE_KEYS } from "@/constants/storage-keys";
const DEFAULT_LANG: Language = "en";

class LocalizationService {
  private currentLang: Language = storageService.getStorage<Language>(
    STORAGE_KEYS.LANG,
    DEFAULT_LANG,
  );

  public setLang(lang: Language): void {
    storageService.setStorage(STORAGE_KEYS.LANG, lang);
    this.currentLang = lang;
  }

  public getLang(): Language {
    return this.currentLang;
  }
}

export const i18n = new LocalizationService();
