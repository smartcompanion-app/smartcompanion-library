import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { ServiceFacade, MenuService } from '@smartcompanion/services';
import { PageMap } from './page-map';
import { Station, StationService } from '@smartcompanion/data';

const meta = {
  title: 'Pages/Page Map',
  tags: ['autodocs'],
  component: PageMap,
  render: args => (
    <div style={{width: "100vw", height: "100vh"}}>
      <sc-page-map {...args} />
    </div>
  ),
} satisfies Meta<PageMap>;

export default meta;

type Story = StoryObj<PageMap>;

export const Example: Story = {
  args: {
    mapBounds: [47.58308, 12.166456, 47.578141, 12.171476],
    tileUrlTemplate: 'map-assets/{z}/{y}/{x}.jpeg',
    mapAttribution: '&copy; basemap.at',
    facade: {
      getStationService: () => ({
        getStations: () => Promise.resolve([
          { id: '1', number: '1', latitude: 47.580, longitude: 12.168 } as Station,
          { id: '2', number: '2', latitude: 47.579, longitude: 12.169 } as Station,
        ]),
      }) as StationService,
      getMenuService: () => ({
        enable: () => {
          console.log('Menu enabled');
          return Promise.resolve();
        },
      }) as MenuService,
      __: (key: string) => {
        switch (key) {
          case 'page-map':
            return 'Map';
          default:
            return key;
        }
      },
    } as ServiceFacade,
  },
};

