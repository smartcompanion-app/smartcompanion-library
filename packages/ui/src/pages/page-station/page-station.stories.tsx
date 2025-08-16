import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { AudioPlayerService, ServiceFacade } from '@smartcompanion/services';
import { PageStation } from './page-station';
import { TourService, StationService } from '@smartcompanion/data';
import { stations, MockAudioPlayer } from '../../utils/test-utils';

type StoryArgs = {
  enableSwitchAudioOutput: boolean;
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Station',
  tags: ['autodocs'],
  component: PageStation,
  render: args => (
    <div style={{width: "100vw", height: "100vh"}}>
      <sc-page-station
        enableSwitchAudioOutput={args.enableSwitchAudioOutput}
        facade={args.facade as ServiceFacade}
      />
    </div>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

const mockAudioPlayer: Partial<AudioPlayerService> = new MockAudioPlayer();

export const Example: Story = {
  args: {
    enableSwitchAudioOutput: false,
    facade: {
      getAudioPlayerService: () => mockAudioPlayer as AudioPlayerService,
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
    },
  },
};

