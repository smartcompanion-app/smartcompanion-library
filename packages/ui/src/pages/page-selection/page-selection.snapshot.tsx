import { render, expect, test, h } from '@stencil/vitest';
import { ServiceFacade, MenuService } from '@smartcompanion/services';
import { StationService } from '@smartcompanion/data';

const facade = {
  getMenuService: () => ({
    enable: () => Promise.resolve(),
  }) as Partial<MenuService>,
  getStationService: () => ({
    getStations: () => Promise.resolve([]),
  }) as Partial<StationService>,
  __: (key: string) => {
    switch (key) {
      case 'menu-selection': return 'Station Selection';
      default: return key;
    }
  },
} as unknown as ServiceFacade;

test('render page selection in initial state', async () => {
  const { root } = await render(<sc-page-selection facade={facade}></sc-page-selection>);
  expect(root).toMatchSnapshot();
});
