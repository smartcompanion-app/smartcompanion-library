import { expect, test, describe, beforeEach } from '@jest/globals';
import { getTour } from '../../fixtures';
import { MemoryStorage } from '../../../src/storage';
import { TourUpdater } from '../../../src/domain';

describe('test tour updater', () => {

  let memoryStorage = new MemoryStorage();
  let dataUpdater = new TourUpdater(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    dataUpdater = new TourUpdater(memoryStorage);
  });

  test('tours should be added to storage', () => {
    const tours = [
      getTour('de', true),
      getTour('de'),
      getTour('en', true),
      getTour('en'),
    ];

    dataUpdater.update(tours);

    expect(memoryStorage.get(`tour-${tours[0].language}-${tours[0].id}`)).toEqual(tours[0]);
    expect(memoryStorage.get(`tour-${tours[1].language}-${tours[1].id}`)).toEqual(tours[1]);
    expect(memoryStorage.get(`tour-${tours[2].language}-${tours[2].id}`)).toEqual(tours[2]);
    expect(memoryStorage.get(`tour-${tours[3].language}-${tours[3].id}`)).toEqual(tours[3]);
    expect(memoryStorage.get(`tours-de`)).toEqual([tours[0], tours[1]]);
    expect(memoryStorage.get(`tours-en`)).toEqual([tours[2], tours[3]]);
  });

  test('adding empty or null data', async () => {
    await dataUpdater.update(null);
    await dataUpdater.update([]);
  });
});
