import { Language } from '@smartcompanion/data';

/**
 * Language selection as needed by the language page, structurally satisfied by
 * the ServiceFacade of @smartcompanion/services.
 */
export interface LanguageSwitcher {
  getLanguages(): Language[];
  changeLanguage(language: string): void;
}
