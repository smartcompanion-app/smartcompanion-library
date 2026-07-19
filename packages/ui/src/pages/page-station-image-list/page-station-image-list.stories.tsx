import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { Menu, StationListFacade, StationSource, TourSource } from '../../contracts';
import { h } from '@stencil/core';
import { PageStationImageList } from './page-station-image-list';
import { stations } from '../../../test/fixtures';

const meta = {
  title: 'Pages/Page Station Image List',
  tags: ['autodocs'],
  component: PageStationImageList,
  render: args => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <sc-page-station-image-list {...args} />
    </div>
  ),
} satisfies Meta<PageStationImageList>;

export default meta;

type Story = StoryObj<PageStationImageList>;

export const Example: Story = {
  args: {
    facade: {
      getMenuService: () => ({
        enable: () => Promise.resolve(),
      }) as Menu,
      getTourService: () => ({
        getStations: (_: string) => {
          return Promise.resolve(stations);
        },
      }) as TourSource,
      getStationService: () => ({
        getStations: () => {
          return Promise.resolve(stations);
        },
      }) as StationSource,
      __: (key: string) => {
        switch (key) {
          case 'station-list':
            return 'Station Overview';
          default:
            return key;
        }
      },
    } as StationListFacade,
  },
};

