import { expect, test, describe, beforeEach } from 'vitest';
import { getStation } from '../../fixtures';
import { MemoryStorage } from '../../../src/storage';
import { StationUpdater } from '../../../src/domain';

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

  test('stations no longer in the data are removed', async () => {
    const kept = getStation('de');
    const removed = getStation('de');

    await dataUpdater.update([kept, removed]);
    await dataUpdater.update([kept]);

    expect(memoryStorage.get('stations-de')).toEqual([kept]);
    expect(memoryStorage.has(`station-de-${kept.id}`)).toBe(true);
    expect(memoryStorage.has(`station-de-${removed.id}`)).toBe(false);
  });

  test('a language without stations keeps no stations', async () => {
    const stationDe = getStation('de');
    const stationEn = getStation('en');

    await dataUpdater.update([stationDe, stationEn]);
    await dataUpdater.update([stationEn]);

    expect(memoryStorage.has('stations-de')).toBe(false);
    expect(memoryStorage.has(`station-de-${stationDe.id}`)).toBe(false);
    expect(memoryStorage.get('stations-en')).toEqual([stationEn]);
  });

  test('all stations removed', async () => {
    const station = getStation('de');

    await dataUpdater.update([station]);
    await dataUpdater.update([]);

    expect(memoryStorage.has('stations-de')).toBe(false);
    expect(memoryStorage.has(`station-de-${station.id}`)).toBe(false);
  });

  test('stations written before the languages were remembered are removed by the stored languages', async () => {
    const station = getStation('de');
    memoryStorage.set('languages', [{ language: 'de', title: 'Deutsch' }]);
    memoryStorage.set('stations-de', [station]);
    memoryStorage.set(`station-de-${station.id}`, station);

    await dataUpdater.update([]);

    expect(memoryStorage.has('stations-de')).toBe(false);
    expect(memoryStorage.has(`station-de-${station.id}`)).toBe(false);
  });

  test('adding empty or null data', async () => {
    await dataUpdater.update(null);
    await dataUpdater.update([]);
  });
});
