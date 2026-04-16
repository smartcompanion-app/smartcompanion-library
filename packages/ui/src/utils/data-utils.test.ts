import { test, expect, vi } from 'vitest';
import { getStations, getSortedStations } from './data-utils';
import { ServiceFacade } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';

const stationA = { id: '1', number: '3' };
const stationB = { id: '2', number: '1' };
const stationC = { id: '3', number: '2' };
const allStations = [stationA, stationB, stationC];

function createFacade(options: { defaultTourId?: string; tourStations?: Partial<Station>[]; allStations?: Partial<Station>[] } = {}) {
  const tourService = {
    getDefaultTour: vi.fn().mockResolvedValue({ id: options.defaultTourId ?? 'tour-1' }),
    getStations: vi.fn().mockResolvedValue(options.tourStations ?? allStations),
  };
  const stationService = {
    getStations: vi.fn().mockResolvedValue(options.allStations ?? allStations),
  };

  return {
    facade: {
      getTourService: () => tourService,
      getStationService: () => stationService,
    } as unknown as ServiceFacade,
    tourService,
    stationService,
  };
}

test('getStations with "default" tourId fetches default tour stations', async () => {
  const { facade, tourService } = createFacade({ defaultTourId: 'tour-default' });
  const result = await getStations(facade, 'default');

  expect(tourService.getDefaultTour).toHaveBeenCalled();
  expect(tourService.getStations).toHaveBeenCalledWith('tour-default');
  expect(result).toEqual(allStations);
});

test('getStations with specific tourId fetches tour stations', async () => {
  const { facade, tourService } = createFacade();
  const result = await getStations(facade, 'tour-42');

  expect(tourService.getStations).toHaveBeenCalledWith('tour-42');
  expect(result).toEqual(allStations);
});

test('getStations with null tourId fetches all stations', async () => {
  const { facade, stationService } = createFacade();
  const result = await getStations(facade, null);

  expect(stationService.getStations).toHaveBeenCalled();
  expect(result).toEqual(allStations);
});

test('getStations with undefined tourId fetches all stations', async () => {
  const { facade, stationService } = createFacade();
  const result = await getStations(facade);

  expect(stationService.getStations).toHaveBeenCalled();
  expect(result).toEqual(allStations);
});

test('getStations with empty string tourId fetches all stations', async () => {
  const { facade, stationService } = createFacade();
  const result = await getStations(facade, '');

  expect(stationService.getStations).toHaveBeenCalled();
  expect(result).toEqual(allStations);
});

test('getSortedStations sorts by parsed station number ascending', async () => {
  const { facade } = createFacade();
  const result = await getSortedStations(facade, null);

  expect(result.map(s => s.number)).toEqual(['1', '2', '3']);
});

test('getSortedStations handles non-numeric station numbers as 0', async () => {
  const stations = [
    { id: '1', number: '5' },
    { id: '2', number: 'abc' },
    { id: '3', number: '2' },
  ];
  const { facade } = createFacade({ allStations: stations });
  const result = await getSortedStations(facade, null);

  expect(result.map(s => s.number)).toEqual(['abc', '2', '5']);
});
