import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { LanguageService } from '../../../src/domain';

describe('test data language', () => {

    let memoryStorage = new MemoryStorage();
    let service = new LanguageService(memoryStorage);

    beforeEach(() => {
        memoryStorage = new MemoryStorage();
        service = new LanguageService(memoryStorage);
    });

    test('should not set undefined as language', () => {
      memoryStorage.set('languages', [
          { title: "English", c: "en" },
          { title: "Deutsch", c: "de" },
      ]);

      let test: any = {};
      service.changeLanguage(test['language']);

      expect(service.hasLanguage()).toBeFalsy();
      expect(memoryStorage.get('language')).toBeNull();
  });

    test('should set language, when no language set in storage', () => {
        memoryStorage.set('languages', [
            { title: "English", language: "en" },
            { title: "Deutsch", language: "de" },
        ]);

        service.changeLanguage('de');

        expect(service.hasLanguage()).toBeTruthy();
        expect(memoryStorage.get('language')).toEqual('de');
    });

    test('should change language when different language set in storage', () => {
        memoryStorage.set('languages', [
            { title: "English", language: "en" },
            { title: "Deutsch", language: "de" },
        ]);

        memoryStorage.set('language', 'en');

        service.changeLanguage('de');

        expect(service.hasLanguage()).toBeTruthy();
        expect(memoryStorage.get('language')).toEqual('de');
    });

    test('should not set any language, if language is not an available language', () => {
        memoryStorage.set('languages', [
            { title: "English", language: "en" },
            { title: "Deutsch", language: "de" },
        ]);

        service.changeLanguage('xy');

        expect(service.hasLanguage()).toBeFalsy();
        expect(memoryStorage.get('language')).toEqual(null);
    });
});
