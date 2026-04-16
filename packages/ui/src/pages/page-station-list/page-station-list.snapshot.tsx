import { render, expect, test, h } from '@stencil/vitest';
import { stations } from '../../../test/fixtures';
import { ServiceFacade, MenuService } from '@smartcompanion/services';
import { TourService, StationService } from '@smartcompanion/data';

const facade = {
  getMenuService: () => ({
    enable: () => Promise.resolve(),
  }) as Partial<MenuService>,
  getTourService: () => ({
    getStations: () => Promise.resolve(stations),
  }) as Partial<TourService>,
  getStationService: () => ({
    getStations: () => Promise.resolve(stations),
  }) as Partial<StationService>,
  __: (key: string) => {
    switch (key) {
      case 'station-list': return 'Station Overview';
      default: return key;
    }
  },
} as unknown as ServiceFacade;

test('render page station list', async () => {
  const { root } = await render(<sc-page-station-list facade={facade}></sc-page-station-list>);
  expect(root).toMatchSnapshot();
});
