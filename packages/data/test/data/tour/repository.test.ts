import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage, Storage } from '../../../src/storage';
import { TourRepository, AssetRepository, StationRepository, Asset } from '../../../src/data';
import { setTourToStorage } from '../../fixtures';

describe('test tour repository', () => {

    let memoryStorage: Storage;
    let repository: TourRepository;
    let assetRepository: AssetRepository;
    let resolveUrl: jest.Mock;

    beforeEach(() => {
        memoryStorage = new MemoryStorage();
        resolveUrl = jest.fn();
        assetRepository = new AssetRepository(memoryStorage, resolveUrl);
        repository = new TourRepository(
            memoryStorage,
            assetRepository,
            new StationRepository(memoryStorage, assetRepository)
        );        
    });
    
    test('should load a tour with assets', async () => {
        memoryStorage.set('language', 'xy');
        resolveUrl.mockReturnValue({});
        const expectedTour = setTourToStorage(memoryStorage, 'xy');        
      
        const tour = await repository.getTour(expectedTour.id);

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

        const tour = await repository.getDefaultTour();
        
        expect(expectedTour.id).toEqual(tour.id);
        expect(resolveUrl.mock.calls.length).toEqual(2);
    });

});
