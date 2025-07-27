import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { TextUpdater } from '../../../src/domain';

describe('test text updater', () => {

  let memoryStorage = new MemoryStorage();
  let dataUpdater = new TextUpdater(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    dataUpdater = new TextUpdater(memoryStorage);
  });

  test('texts should be added to storage', () => {
    const texts = [
      { key: "text1", value: "blabla_de_1", language: "de" },
      { key: "text1", value: "blabla_en_1", language: "en" },
      { key: "text2", value: "blabla_de_2", language: "de" },
      { key: "text2", value: "blabla_en_2", language: "en" },
    ];

    dataUpdater.update(texts);

    expect(memoryStorage.get('texts-de-text1')).toEqual(texts[0].value);
    expect(memoryStorage.get('texts-en-text1')).toEqual(texts[1].value);
    expect(memoryStorage.get('texts-de-text2')).toEqual(texts[2].value);
    expect(memoryStorage.get('texts-en-text2')).toEqual(texts[3].value);
  });

  test('adding empty or null data', async () => {
    await dataUpdater.update(null);
    await dataUpdater.update([]);
  });
});
