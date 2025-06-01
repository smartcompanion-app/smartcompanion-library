import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { AssetUpdater } from '../../../src/data';
import { getAsset } from '../../fixtures';

describe('test asset updater', () => {

    let memoryStorage = new MemoryStorage();
    let dataUpdater = new AssetUpdater(memoryStorage);

    beforeEach(() => {
        memoryStorage = new MemoryStorage();
        dataUpdater = new AssetUpdater(memoryStorage);
    });

    test('assets should be added to storage', () => {
        const asset1 = getAsset();
        const asset2 = getAsset();

        dataUpdater.update([
            asset1,
            asset2
        ]);

        expect(memoryStorage.get(`asset-${asset1.id}`)).toEqual(asset1);
        expect(memoryStorage.get(`asset-${asset2.id}`)).toEqual(asset2);
        expect(memoryStorage.get('assets')).toEqual([asset1, asset2]);
    });

    test('adding empty or null data', async () => {
        await dataUpdater.update(null);
        await dataUpdater.update([]);
    });

});