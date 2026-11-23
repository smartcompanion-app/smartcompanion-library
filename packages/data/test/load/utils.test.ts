import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import { MemoryStorage } from '../../src/storage';
import { LanguageService } from '../../src/domain';
import { autoSelectLanguage } from '../../src/load/utils';

describe('autoSelectLanguage', () => {
  let memoryStorage: MemoryStorage;
  let service: LanguageService;
  const originalLocation = globalThis.location;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    service = new LanguageService(memoryStorage);
    (globalThis as any).location = { search: '' };
  });

  afterEach(() => {
    (globalThis as any).location = originalLocation;
  });

  function setLanguages(languages: Array<{ title: string; language: string }>) {
    memoryStorage.set('languages', languages);
  }

  function setUrlSearch(search: string) {
    (globalThis as any).location = { search };
  }

  test('should auto-select language from URL parameter when available', () => {
    setUrlSearch('?language=de');
    setLanguages([
      { title: 'English', language: 'en' },
      { title: 'Deutsch', language: 'de' },
    ]);

    autoSelectLanguage(service);

    expect(service.hasLanguage()).toBeTruthy();
    expect(service.getCurrentLanguage()).toBe('de');
  });

  test('should not select language from URL parameter when not available', () => {
    setUrlSearch('?language=fr');
    setLanguages([
      { title: 'English', language: 'en' },
      { title: 'Deutsch', language: 'de' },
    ]);

    autoSelectLanguage(service);

    expect(service.hasLanguage()).toBeFalsy();
  });

  test('should auto-select single available language when no URL parameter', () => {
    setLanguages([{ title: 'English', language: 'en' }]);

    autoSelectLanguage(service);

    expect(service.hasLanguage()).toBeTruthy();
    expect(service.getCurrentLanguage()).toBe('en');
  });

  test('should not auto-select when multiple languages and no URL parameter', () => {
    setLanguages([
      { title: 'English', language: 'en' },
      { title: 'Deutsch', language: 'de' },
    ]);

    autoSelectLanguage(service);

    expect(service.hasLanguage()).toBeFalsy();
  });

  test('should not change language when already set', () => {
    setUrlSearch('?language=de');
    setLanguages([
      { title: 'English', language: 'en' },
      { title: 'Deutsch', language: 'de' },
    ]);
    service.changeLanguage('en');

    autoSelectLanguage(service);

    expect(service.getCurrentLanguage()).toBe('en');
  });

  describe('when the set language is no longer available', () => {
    beforeEach(() => {
      setLanguages([{ title: 'English', language: 'en' }]);
      service.changeLanguage('en');
    });

    test('should select the only remaining language', () => {
      setLanguages([{ title: 'Deutsch', language: 'de' }]);

      autoSelectLanguage(service);

      expect(service.getCurrentLanguage()).toBe('de');
      expect(memoryStorage.get('language')).toBe('de');
    });

    test('should select the language from the URL parameter', () => {
      setUrlSearch('?language=fr');
      setLanguages([
        { title: 'Deutsch', language: 'de' },
        { title: 'Français', language: 'fr' },
      ]);

      autoSelectLanguage(service);

      expect(service.getCurrentLanguage()).toBe('fr');
    });

    test('should have no language when several remain', () => {
      setLanguages([
        { title: 'Deutsch', language: 'de' },
        { title: 'Français', language: 'fr' },
      ]);

      autoSelectLanguage(service);

      expect(service.hasLanguage()).toBeFalsy();
      expect(memoryStorage.has('language')).toBeFalsy();
    });
  });
});
