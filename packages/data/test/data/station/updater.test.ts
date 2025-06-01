import { expect, test, describe, beforeEach } from '@jest/globals';
import { getStation } from '../../fixtures';
import { MemoryStorage } from '../../../src/storage';
import { StationUpdater } from '../../../src/data';

describe('test station updater', () => {

    let memoryStorage = new MemoryStorage();
    let dataUpdater = new StationUpdater(memoryStorage);

    beforeEach(() => {
        memoryStorage = new MemoryStorage();
        dataUpdater = new StationUpdater(memoryStorage);
    });

    test('stations should be added to storage', () => {
        const station1 = getStation('de');
        const station2 = getStation('en');
        const station3 = getStation('de');

        dataUpdater.update([
            station1,
            station2,
            station3
        ]);

        expect(memoryStorage.get(`station-${station1.language}-${station1.id}`)).toEqual(station1);
        expect(memoryStorage.get(`station-${station2.language}-${station2.id}`)).toEqual(station2);
        expect(memoryStorage.get(`station-${station3.language}-${station3.id}`)).toEqual(station3);
        expect(memoryStorage.get('stations-de')).toEqual([station1, station3]);
        expect(memoryStorage.get('stations-en')).toEqual([station2]);
    });

    test('adding empty or null data', async () => {
        await dataUpdater.update(null);
        await dataUpdater.update([]);
    });

});