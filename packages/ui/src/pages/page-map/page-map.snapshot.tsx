import { render, expect, test, h } from '@stencil/vitest';
import { Menu, StationListFacade, StationSource } from '../../contracts';
import { Station } from '@smartcompanion/data';

const facade = {
  getStationService: () => ({
    getStations: () => Promise.resolve([
      { id: '1', number: '1', latitude: 47.580, longitude: 12.168 } as Station,
      { id: '2', number: '2', latitude: 47.579, longitude: 12.169 } as Station,
    ]),
  }) as Partial<StationSource>,
  getMenuService: () => ({
    enable: () => Promise.resolve(),
  }) as Partial<Menu>,
  __: (key: string) => {
    switch (key) {
      case 'page-map': return 'Map';
      default: return key;
    }
  },
} as unknown as StationListFacade;

// Leaflet requires real DOM (element.children iteration), skip in mock-doc
test.skip('render page map', async () => {
  const { root } = await render(
    <sc-page-map
      mapBounds={[47.58308, 12.166456, 47.578141, 12.171476]}
      tileUrlTemplate="map-assets/{z}/{y}/{x}.jpeg"
      mapAttribution="&copy; basemap.at"
      facade={facade}
    ></sc-page-map>
  );
  expect(root).toMatchSnapshot();
});
