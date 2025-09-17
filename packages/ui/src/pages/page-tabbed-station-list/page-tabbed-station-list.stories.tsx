import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { MenuService, ServiceFacade } from '@smartcompanion/services';
import { TourService, StationService } from '@smartcompanion/data';
import { PageTabbedStationList } from './page-tabbed-station-list';
import { stations } from '../../../test/fixtures';

type StoryArgs = {
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Tabbed Station List',
  tags: ['autodocs'],
  component: PageTabbedStationList,
  render: args => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <sc-page-tabbed-station-list facade={args.facade as ServiceFacade} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

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
    },
  },
};

