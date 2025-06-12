import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../src/storage';
import { UpdateProcessor } from '../../src/update';

describe('test data updater', () => {

  let memoryStorage = new MemoryStorage();
  let updateProcessor = new UpdateProcessor(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    updateProcessor = new UpdateProcessor(memoryStorage);
  });

  test('update should be required if checksums are different', () => {
    memoryStorage.set('checksum', '123');
    expect(updateProcessor.requiresUpdate({ checksum: '234' })).toBeTruthy();
  });

  test('update should be required if checksums is unset', () => {
    expect(updateProcessor.requiresUpdate({ checksum: '234' })).toBeTruthy();
  });

  test('no update should be required if checksums are equal', () => {
    memoryStorage.set('checksum', '123');
    expect(updateProcessor.requiresUpdate({ checksum: '123' })).toBeFalsy();
  });

  test('updaters should be loaded based on keys in the data and availability of Updater', () => {
    class MockUpdater {
      update = jest.fn();
    }
    const mockAssetUpdater = new MockUpdater();
    const mockStationUpdater = new MockUpdater();

    updateProcessor.registerUpdater('assets', mockAssetUpdater);
    updateProcessor.registerUpdater('stations', mockStationUpdater);    

    const data = {
      stations: [{ id: '1', name: 'Station 1' }],
      texts: [{ id: '1', content: 'Text 1' }],      
    };

    updateProcessor.update(data);

    expect(mockAssetUpdater.update).not.toHaveBeenCalled();
    expect(mockStationUpdater.update).toHaveBeenCalled();
  });

  test('adding empty or null data', async () => {
    await updateProcessor.update(null);
    await updateProcessor.update({});
  });
});
