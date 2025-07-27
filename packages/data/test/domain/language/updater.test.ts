import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { LanguageUpdater } from '../../../src/domain';

describe('test language updater', () => {

  let memoryStorage = new MemoryStorage();
  let dataUpdater = new LanguageUpdater(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    dataUpdater = new LanguageUpdater(memoryStorage);
  });

  test('languages should be added to storage', () => {
    const languages = [
      { title: "Deutsch", language: "de" },
      { title: "English", language: "en" },
    ];

    dataUpdater.update(languages);

    expect(memoryStorage.get('languages')).toEqual(languages);
  });

  test('adding empty or null data', async () => {
    await dataUpdater.update(null);
    await dataUpdater.update([]);
  });
});
