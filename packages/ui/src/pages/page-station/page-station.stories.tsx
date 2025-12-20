import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { AudioPlayerService, MenuService, ServiceFacade } from '@smartcompanion/services';
import { TourService, StationService } from '@smartcompanion/data';
import { stations } from '../../../test/fixtures';
import { PageStation } from './page-station';

const meta = {
  title: 'Pages/Page Station',
  tags: ['autodocs'],
  component: PageStation,
  render: args => (
    <div style={{width: "100vw", height: "100vh"}}>
      <sc-page-station {...args} />
    </div>
  ),
} satisfies Meta<PageStation>;

export default meta;

type Story = StoryObj<PageStation>;

const audioPlayerService: AudioPlayerService = new AudioPlayerService("");

export const Example: Story = {
  args: {
    enableSwitchAudioOutput: false,
    facade: {
      getAudioPlayerService: () => audioPlayerService,
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
      getMenuService: () => ({
        enable: () => Promise.resolve(),
      }) as MenuService
    } as ServiceFacade,
  },
};

