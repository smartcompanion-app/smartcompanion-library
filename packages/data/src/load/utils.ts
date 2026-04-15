import { LanguageService } from '../domain';

/**
 * If no language is set, try to auto-select one:
 * 1. From the URL query parameter `?language=de`
 * 2. If only one language is available, select it automatically
 */
export const autoSelectLanguage = (languageService: LanguageService) => {
  if (languageService.hasLanguage()) return;

  const languages = languageService.getLanguages();

  const search = typeof window !== 'undefined' ? window.location.search : '';
  const params = new URLSearchParams(search);
  const languageParam = params.get('language');
  if (languageParam && languages.some((l) => l.language === languageParam)) {
    languageService.changeLanguage(languageParam);
    return;
  }

  if (languages.length === 1) {
    languageService.changeLanguage(languages[0].language);
  }
};
