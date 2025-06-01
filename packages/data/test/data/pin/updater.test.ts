import { expect, test, describe, beforeEach } from '@jest/globals';
import { getPin } from '../../fixtures';
import { MemoryStorage } from '../../../src/storage';
import { PinUpdater } from '../../../src/data';

describe('test pin updater', () => {

    let memoryStorage = new MemoryStorage();
    let dataUpdater = new PinUpdater(memoryStorage);

    beforeEach(() => {
        memoryStorage = new MemoryStorage();
        dataUpdater = new PinUpdater(memoryStorage);
    });

    test('pins should be added to storage', () => {
        const pins = [
            getPin(),
            getPin(),
            getPin()
        ];

        dataUpdater.update(pins);

        expect(memoryStorage.get('pins')).toEqual(pins);        
    });

    test('adding empty or null data', async () => {
        await dataUpdater.update(null);
        await dataUpdater.update([]);
    });

});