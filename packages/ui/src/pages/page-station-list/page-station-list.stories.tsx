import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { MenuService, ServiceFacade } from '@smartcompanion/services';
import { TourService, StationService } from '@smartcompanion/data';
import { PageStationList } from './page-station-list';
import { stations } from '../../../test/fixtures';

const meta = {
  title: 'Pages/Page Station List',
  tags: ['autodocs'],
  component: PageStationList,
  render: args => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <sc-page-station-list facade={args.facade as ServiceFacade} />
    </div>
  ),
} satisfies Meta<PageStationList>;

export default meta;

type Story = StoryObj<PageStationList>;

export const Example: Story = {
  args: {
    facade: {
      getMenuService: () => ({
        enable: () => Promise.resolve(),
      }) as MenuService,
      getTourService: () => ({
        getStations: (_: string) => {
          return Promise.resolve(stations);
        },
      }) as TourService,
      getStationService: () => ({
        getStations: () => {
          return Promise.resolve(stations);
        },
      }) as StationService,
      __: (key: string) => {
        switch (key) {
          case 'station-list':
            return 'Station Overview';
          default:
            return key;
        }
      },
    } as ServiceFacade,
  },
};

