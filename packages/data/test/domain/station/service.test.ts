import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage, Storage } from '../../../src/storage';
import { StationService, AssetService, Asset } from '../../../src/domain';
import { setStationToStorage } from '../../fixtures';

describe('test station service', () => {

  let memoryStorage: Storage;
  let service: StationService;
  let resolveUrl: jest.Mock;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    resolveUrl = jest.fn();
    service = new StationService(memoryStorage, new AssetService(memoryStorage, resolveUrl));
  });

  test('should load a station with assets', async () => {
    memoryStorage.set('language', 'xy');
    resolveUrl.mockReturnValue('http://internal.url');
    const expectedStation = setStationToStorage(memoryStorage, 'xy');

    const station = await service.getStation(expectedStation.id);

    expect(station.id).toEqual(expectedStation.id);
    expect((station.images[0] as Asset).id).toEqual(expectedStation.images[0]);
    expect((station.images[1] as Asset).id).toEqual(expectedStation.images[1]);
    expect((station.audios[0] as Asset).id).toEqual(expectedStation.audios[0]);
    expect((station.audios[1] as Asset).id).toEqual(expectedStation.audios[1]);
    expect(resolveUrl.mock.calls.length).toEqual(4);
  });

  test('should load stations with given language and with asset resolution', async () => {
    memoryStorage.set('language', 'xy');
    resolveUrl.mockReturnValue('http://internal.url');
    setStationToStorage(memoryStorage, 'xy');
    setStationToStorage(memoryStorage, 'xy');
    setStationToStorage(memoryStorage, 'ab');

    const stations = await service.getStations();

    expect(stations.length).toEqual(2);
    expect(resolveUrl.mock.calls.length).toEqual(8); // each station has 4 assets defined
  });

  test('should load stations with given language and without asset resolution', () => {
    memoryStorage.set('language', 'xy');
    resolveUrl.mockReturnValue('http://internal.url');
    setStationToStorage(memoryStorage, 'xy');
    setStationToStorage(memoryStorage, 'xy');
    setStationToStorage(memoryStorage, 'ab');

    const stations = service.getUnresolvedStations();

    expect(stations.length).toEqual(2);
    expect(resolveUrl.mock.calls.length).toEqual(0);
  });

  test('should store collected percentage for station', async () => {
    resolveUrl.mockReturnValue('http://internal.url');
    memoryStorage.set('language', 'xy');

    const initialStation = setStationToStorage(memoryStorage, 'xy', 1);    
    const updatedStation = await service.updateCollectedPercentage(initialStation.id, initialStation.audios[0] as string, 0.456);

    // check single stations
    expect(updatedStation?.collectedPercentage).toEqual(0.456);
    expect(memoryStorage.get(`station-xy-${initialStation.id}`).collectedPercentage).toEqual(0.456);

    // check all stations
    const storedStations = memoryStorage.get(`stations-xy`);
    expect(storedStations.filter((station: any) => station.id == initialStation.id).length).toEqual(1);
    expect(storedStations.filter((station: any) => station.id == initialStation.id)[0].collectedPercentage).toEqual(0.456);
  });

  test('should not throw for non existing station, when storing collected percentage', async () => {
    expect(async () => service.updateCollectedPercentage("123", "123", 0.456)).not.toThrow();
  });

  test('should remove collected percentage for all stations in language', async () => {
    resolveUrl.mockReturnValue('http://internal.url');
    memoryStorage.set('language', 'xy');

    setStationToStorage(memoryStorage, 'xy', 1, true);
    setStationToStorage(memoryStorage, 'xy', 1, true);
    setStationToStorage(memoryStorage, 'xy', 1, true);

    expect(memoryStorage.get(`stations-xy`).filter((station: any) => station.collectedPercentage > 0 && station.collectedPercentage < 1).length).toEqual(3);
    await service.clearCollectedPercentage('xy');
    expect(memoryStorage.get(`stations-xy`).filter((station: any) => station.collectedPercentage == 0).length).toEqual(3);
  });

  test('should not throw for non existing language, when clearing collected percentage', async () => {
    expect(() => service.clearCollectedPercentage('xy')).not.toThrow();
  });
});
