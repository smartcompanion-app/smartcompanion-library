import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage, Storage } from '../../../src/storage';
import { TourService, AssetService, StationService, Asset } from '../../../src/domain';
import { setTourToStorage } from '../../fixtures';

describe('test tour service', () => {

  let memoryStorage: Storage;
  let service: TourService;
  let assetService: AssetService;
  let resolveUrl: jest.Mock;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    resolveUrl = jest.fn();
    assetService = new AssetService(memoryStorage, resolveUrl);
    service = new TourService(
      memoryStorage,
      assetService,
      new StationService(memoryStorage, assetService)
    );
  });

  test('should load a tour with assets', async () => {
    memoryStorage.set('language', 'xy');
    resolveUrl.mockReturnValue({});
    const expectedTour = setTourToStorage(memoryStorage, 'xy');

    const tour = await service.getTour(expectedTour.id);

    expect(tour.id).toEqual(expectedTour.id);
    expect((tour.images[0] as Asset).id).toEqual(expectedTour.images[0]);
    expect((tour.images[1] as Asset).id).toEqual(expectedTour.images[1]);
    expect(resolveUrl.mock.calls.length).toEqual(2);
  });

  test('should load default tour, with respective language', async () => {
    memoryStorage.set('language', 'xy');
    resolveUrl.mockReturnValue({});
    const expectedTour = setTourToStorage(memoryStorage, 'xy', true);
    setTourToStorage(memoryStorage, 'xy');
    setTourToStorage(memoryStorage, 'ab', true);
    setTourToStorage(memoryStorage, 'ab');

    const tour = await service.getDefaultTour();

    expect(expectedTour.id).toEqual(tour.id);
    expect(resolveUrl.mock.calls.length).toEqual(2);
  });
});
