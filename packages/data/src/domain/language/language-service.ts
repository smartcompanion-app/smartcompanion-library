import { Storage } from '../../storage/index.js';
import { Language } from './language.js';

export class LanguageService {
  protected storage: Storage;
  protected language: string = '';

  constructor(storage: Storage) {
    this.storage = storage;

    if (this.storage.has('language')) {
      this.changeLanguage(this.storage.get('language') as string);
    }
  }

  changeLanguage(language: string) {
    if (typeof language === 'string' && this.getLanguages().some(item => item.language == language)) {
      this.storage.set('language', language);
      this.language = language;
    }
  }

  /**
   * Unsets the chosen language when it is not among the available ones, which can
   * change after the language was chosen.
   */
  unsetUnavailableLanguage() {
    if (this.storage.has('language') && !this.getLanguages().some(item => item.language == this.storage.get('language'))) {
      this.storage.unset('language');
      this.language = '';
    }
  }

  hasLanguage(): boolean {
    return this.language != '';
  }

  getCurrentLanguage(): string {
    return this.language;
  }

  getLanguages(): Array<Language> {
    if (this.storage.has('languages')) {
      return (this.storage.get('languages') as Array<Language>) || [];
    } else {
      return [];
    }
  }
}
