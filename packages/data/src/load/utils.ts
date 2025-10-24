import { LanguageService } from "../domain";

/**
 * If only one language is available and no language is set, set that language automatically
 * and prevent the language selection screen from showing up.
 */
export const autoSelectLanguage = (languageService: LanguageService) => {
  const languages = languageService.getLanguages();
  if (!languageService.hasLanguage() && languages.length === 1) {
    languageService.changeLanguage(languages[0].language);
  }
};
