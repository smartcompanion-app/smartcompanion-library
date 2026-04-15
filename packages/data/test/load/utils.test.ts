import { expect, test, describe, beforeEach, afterEach } from '@jest/globals';
import { MemoryStorage } from '../../src/storage';
import { LanguageService } from '../../src/domain';
import { autoSelectLanguage } from '../../src/load/utils';

describe('autoSelectLanguage', () => {
  let memoryStorage: MemoryStorage;
  let service: LanguageService;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    service = new LanguageService(memoryStorage);
    (globalThis as any).window = { location: { search: '' } };
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  function setLanguages(languages: Array<{ title: string; language: string }>) {
    memoryStorage.set('languages', languages);
  }

  function setUrlSearch(search: string) {
    (globalThis as any).window = { location: { search } };
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

  test('should prefer URL parameter over single language fallback', () => {
    setUrlSearch('?language=de');
    setLanguages([
      { title: 'English', language: 'en' },
      { title: 'Deutsch', language: 'de' },
    ]);

    autoSelectLanguage(service);

    expect(service.getCurrentLanguage()).toBe('de');
  });
});
