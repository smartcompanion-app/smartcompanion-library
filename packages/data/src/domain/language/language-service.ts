import { Storage } from "../../storage";
import { Language } from "./language";

export class LanguageService {

  protected storage: Storage;
  protected language: string = "";

  constructor(storage: Storage) {
    this.storage = storage;

    if (this.storage.has('language')) {
      this.changeLanguage(this.storage.get('language'));
    }
  }

  changeLanguage(language: string) {
    if (
      typeof language === 'string' &&
      this.getLanguages().some(item => item.language == language)
    ) {
      this.storage.set('language', language);
      this.language = language;
    }
  }

  hasLanguage(): boolean {
    return this.language != "";
  }

  getCurrentLanguage(): string {
    return this.language;
  }

  getLanguages(): Array<Language> {
    if (this.storage.has('languages')) {
      return this.storage.get('languages') || [];
    } else {
      return [];
    }
  }
}
