import { expect, test, describe, beforeEach } from 'vitest';
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
      expect(memoryStorage.has('language')).toBeFalsy();
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
        expect(memoryStorage.has('language')).toBeFalsy();
    });

    describe('unsetUnavailableLanguage', () => {
        const en = { title: "English", language: "en" };
        const de = { title: "Deutsch", language: "de" };

        test('should unset a language that is no longer available', () => {
            memoryStorage.set('languages', [en, de]);
            service.changeLanguage('en');
            memoryStorage.set('languages', [de]);

            service.unsetUnavailableLanguage();

            expect(service.hasLanguage()).toBeFalsy();
            expect(service.getCurrentLanguage()).toEqual('');
            expect(memoryStorage.has('language')).toBeFalsy();
        });

        test('should keep a language that is still available', () => {
            memoryStorage.set('languages', [en, de]);
            service.changeLanguage('en');
            memoryStorage.set('languages', [en]);

            service.unsetUnavailableLanguage();

            expect(service.getCurrentLanguage()).toEqual('en');
            expect(memoryStorage.get('language')).toEqual('en');
        });

        test('should unset a stored language the service did not accept when it was created', () => {
            memoryStorage.set('languages', [de]);
            memoryStorage.set('language', 'en');
            service = new LanguageService(memoryStorage);
            expect(service.hasLanguage()).toBeFalsy();

            service.unsetUnavailableLanguage();

            expect(memoryStorage.has('language')).toBeFalsy();
        });

        test('should do nothing when no language is set', () => {
            memoryStorage.set('languages', [en, de]);

            service.unsetUnavailableLanguage();

            expect(service.hasLanguage()).toBeFalsy();
            expect(memoryStorage.has('language')).toBeFalsy();
        });
    });
});
