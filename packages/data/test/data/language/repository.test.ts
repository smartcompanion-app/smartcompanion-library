import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { LanguageRepository } from '../../../src/data';

describe('test data language', () => {

    let memoryStorage = new MemoryStorage();
    let repository = new LanguageRepository(memoryStorage);

    beforeEach(() => {
        memoryStorage = new MemoryStorage();
        repository = new LanguageRepository(memoryStorage);
    });

    test('should not set undefined as language', () => {
      memoryStorage.set('languages', [
          { title: "English", c: "en" },
          { title: "Deutsch", c: "de" },
      ]);

      let test: any = {};
      repository.changeLanguage(test['language']);

      expect(repository.hasLanguage()).toBeFalsy();
      expect(memoryStorage.get('language')).toBeNull();
  });

    test('should set language, when no language set in storage', () => {
        memoryStorage.set('languages', [
            { title: "English", language: "en" },
            { title: "Deutsch", language: "de" },
        ]);

        repository.changeLanguage('de');

        expect(repository.hasLanguage()).toBeTruthy();
        expect(memoryStorage.get('language')).toEqual('de');
    });

    test('should change language when different language set in storage', () => {
        memoryStorage.set('languages', [
            { title: "English", language: "en" },
            { title: "Deutsch", language: "de" },
        ]);

        memoryStorage.set('language', 'en');

        repository.changeLanguage('de');

        expect(repository.hasLanguage()).toBeTruthy();
        expect(memoryStorage.get('language')).toEqual('de');
    });

    test('should not set any language, if language is not an available language', () => {
        memoryStorage.set('languages', [
            { title: "English", language: "en" },
            { title: "Deutsch", language: "de" },
        ]);

        repository.changeLanguage('xy');

        expect(repository.hasLanguage()).toBeFalsy();
        expect(memoryStorage.get('language')).toEqual(null);
    });

});