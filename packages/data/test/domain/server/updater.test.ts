import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { ServerUpdater } from '../../../src/domain';

describe('test server updater', () => {

  let memoryStorage = new MemoryStorage();
  let dataUpdater = new ServerUpdater(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    dataUpdater = new ServerUpdater(memoryStorage);
  });

  test('servers should be added to storage', () => {
    const servers = [
      "abc",
      "xyz"
    ];
    dataUpdater.update(servers);
    expect(memoryStorage.get('servers')).toEqual(servers);
  });

  test('adding empty or null data', async () => {
    await dataUpdater.update(null);
    await dataUpdater.update([]);
  });
});
