import { render, expect, test, h } from '@stencil/vitest';
import { Menu, StationListFacade, StationSource } from '../../contracts';

const facade = {
  getMenuService: () => ({
    enable: () => Promise.resolve(),
  }) as Partial<Menu>,
  getStationService: () => ({
    getStations: () => Promise.resolve([]),
  }) as Partial<StationSource>,
  __: (key: string) => {
    switch (key) {
      case 'menu-selection': return 'Station Selection';
      default: return key;
    }
  },
} as unknown as StationListFacade;

test('render page selection in initial state', async () => {
  const { root } = await render(<sc-page-selection facade={facade}></sc-page-selection>);
  expect(root).toMatchSnapshot();
});
