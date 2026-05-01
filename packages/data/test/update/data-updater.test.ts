import { expect, test, describe, beforeEach, vi } from 'vitest';
import { MemoryStorage } from '../../src/storage';
import { DataUpdater } from '../../src/update';

describe('test data updater', () => {

  let memoryStorage = new MemoryStorage();
  let dataUpdater = new DataUpdater(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    dataUpdater = new DataUpdater(memoryStorage);
  });

  test('check valid data object', () => {
    expect(dataUpdater.isValidDataObject(null)).toBeFalsy();
    expect(dataUpdater.isValidDataObject(undefined)).toBeFalsy();
    expect(dataUpdater.isValidDataObject([])).toBeFalsy();
    expect(dataUpdater.isValidDataObject("123")).toBeFalsy();
    expect(dataUpdater.isValidDataObject({})).toBeFalsy();
    expect(dataUpdater.isValidDataObject({ checksum: '123' })).toBeFalsy();
    expect(dataUpdater.isValidDataObject({ checksum: '123', assets: [], stations: [], languages: [], texts: [] })).toBeTruthy();
  });

  test('update should be required if checksums are different', () => {
    memoryStorage.set('checksum', '123');
    expect(dataUpdater.requiresUpdate({ checksum: '234' })).toBeTruthy();
  });

  test('update should be required if checksums is unset', () => {
    expect(dataUpdater.requiresUpdate({ checksum: '234' })).toBeTruthy();
  });

  test('no update should be required if checksums are equal', () => {
    memoryStorage.set('checksum', '123');
    expect(dataUpdater.requiresUpdate({ checksum: '123' })).toBeFalsy();
  });

  test('updaters should be loaded based on keys in the data and availability of Updater', () => {
    class MockUpdater {
      update = vi.fn();
    }
    const mockAssetUpdater = new MockUpdater();
    const mockLanguageUpdater = new MockUpdater();
    const mockStationUpdater = new MockUpdater();
    const mockTextUpdater = new MockUpdater();
    const mockTourUpdater = new MockUpdater();

    dataUpdater.registerUpdater('assets', mockAssetUpdater);
    dataUpdater.registerUpdater('stations', mockStationUpdater);
    dataUpdater.registerUpdater('texts', mockTextUpdater);
    dataUpdater.registerUpdater('languages', mockLanguageUpdater);
    dataUpdater.registerUpdater('tours', mockTourUpdater);

    const data = {
      checksum: '123',
      assets: [{ id: '1', name: 'Asset 1' }],
      stations: [{ id: '1', name: 'Station 1' }],
      texts: [{ id: '1', content: 'Text 1' }],
      languages: [{ id: '1', name: 'Language 1' }]      
    };

    dataUpdater.update(data);

    expect(mockTourUpdater.update).not.toHaveBeenCalled();
    expect(mockStationUpdater.update).toHaveBeenCalled();
    expect(mockAssetUpdater.update).toHaveBeenCalled();
    expect(mockLanguageUpdater.update).toHaveBeenCalled();
    expect(mockTextUpdater.update).toHaveBeenCalled();
  });

  test('update should handle invalid data gracefully', async () => {
    await dataUpdater.update(null);
    await dataUpdater.update({});
    await dataUpdater.update(undefined);
    await dataUpdater.update([]);
    await dataUpdater.update('123');
  });
});
