import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { DataUpdater, AssetUpdater, StationUpdater, TextUpdater, LanguageUpdater, PinUpdater } from '../../../src/data';

describe('test data updater', () => {

    let memoryStorage = new MemoryStorage();
    let dataUpdater = new DataUpdater(memoryStorage);

    beforeEach(() => {
        memoryStorage = new MemoryStorage();
        dataUpdater = new DataUpdater(memoryStorage);
    });

    test('update should be required if checksums are different', () => {
        memoryStorage.set('checksum', '123');
        expect(dataUpdater.requiresUpdate({checksum: '234'})).toBeTruthy;
    });

    test('update should be required if checksums is unset', () => {
        expect(dataUpdater.requiresUpdate({checksum: '234'})).toBeTruthy;
    });

    test('no update should be required if checksums are equal', () => {
        memoryStorage.set('checksum', '123');
        expect(dataUpdater.requiresUpdate({checksum: '123'})).toBeFalsy;
    });

    test('updaters should be loaded based on keys in the data', () => {
        const data: {[k:string]: string[]} = {
            "assets": [],
            "stations": [],
            "texts": [],
            "languages": [],
            "pins": []
        };

        const updaters = dataUpdater.getUpdaters(data);

        expect(updaters["assets"]).toBeInstanceOf(AssetUpdater);
        expect(updaters["stations"]).toBeInstanceOf(StationUpdater);
        expect(updaters["texts"]).toBeInstanceOf(TextUpdater);
        expect(updaters["languages"]).toBeInstanceOf(LanguageUpdater);
        expect(updaters["pins"]).toBeInstanceOf(PinUpdater);
    });

    test('adding empty or null data', async () => {
        await dataUpdater.update(null);
        await dataUpdater.update({});
    });

});