import { expect, test, describe, beforeEach } from 'vitest';
import { MemoryStorage } from '../../../src/storage';
import { ShareUpdater } from '../../../src/domain';

describe('test share updater', () => {

  let memoryStorage = new MemoryStorage();
  let dataUpdater = new ShareUpdater(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    dataUpdater = new ShareUpdater(memoryStorage);
  });

  test('share should be added to storage', async () => {
    const share = "https://example.com";
    await dataUpdater.update(share);
    expect(memoryStorage.get('share')).toEqual(share);
  });

  test('adding empty or null data', async () => {
    await dataUpdater.update(null);
    await dataUpdater.update(undefined);
    await dataUpdater.update([]);
    await dataUpdater.update({});
    expect(memoryStorage.has('share')).toBeFalsy();
  });
});
