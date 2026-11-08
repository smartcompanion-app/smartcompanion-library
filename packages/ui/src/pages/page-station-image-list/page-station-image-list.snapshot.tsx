import { render, expect, test, h } from '@stencil/vitest';
import { Menu, StationListFacade, StationSource, TourSource, TranslationKey } from '../../contracts';
import { stations } from '../../../test/fixtures';

const facade = {
  getMenuService: () =>
    ({
      enable: () => Promise.resolve(),
    }) as Partial<Menu>,
  getTourService: () =>
    ({
      getStations: () => Promise.resolve(stations),
    }) as Partial<TourSource>,
  getStationService: () =>
    ({
      getStations: () => Promise.resolve(stations),
    }) as Partial<StationSource>,
  __: (key: TranslationKey) => {
    switch (key) {
      case 'station-list':
        return 'Station Overview';
      case 'view':
        return 'View';
      default:
        return key;
    }
  },
} as unknown as StationListFacade;

test('render page station image list', async () => {
  const { root } = await render(<sc-page-station-image-list facade={facade}></sc-page-station-image-list>);
  expect(root).toMatchSnapshot();
});

test('render page station image list for stations without images', async () => {
  const withoutImages = stations.map(station => ({ ...station, images: [] }));
  const facadeWithoutImages = {
    ...facade,
    getStationService: () => ({ getStations: () => Promise.resolve(withoutImages) }) as Partial<StationSource>,
  } as unknown as StationListFacade;

  const { root } = await render(<sc-page-station-image-list facade={facadeWithoutImages}></sc-page-station-image-list>);

  expect(root.querySelectorAll('.station-image-list-description').length).toBe(stations.length);
});
