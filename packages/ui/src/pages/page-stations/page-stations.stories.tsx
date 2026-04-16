import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { AudioPlayerService, ServiceFacade, MenuService, CollectibleAudioPlayerService } from '@smartcompanion/services';
import { StationService } from '@smartcompanion/data';
import { stations } from '../../../test/fixtures';
import { PageStations } from './page-stations';

const meta = {
  title: 'Pages/Page Stations',
  tags: ['autodocs'],
  component: PageStations,
  render: args => (
    <div style={{width: "100vw", height: "100vh"}}>
      <sc-page-stations {...args} />
    </div>
  ),
} satisfies Meta<PageStations>;

export default meta;

type Story = StoryObj<PageStations>;

const audioPlayerService: AudioPlayerService = new CollectibleAudioPlayerService("");

export const Example: Story = {
  args: {
    stationId: "default",
    enableSwitchAudioOutput: false,
    facade: {
      getAudioPlayerService: () => audioPlayerService,
      getStationService: () => ({
        updateCollectedPercentage: (stationId: string, _: string, collectedPercentage: number) => {
          console.log(`Station ${stationId} collected percentage updated to ${collectedPercentage}`);
          return Promise.resolve({
            ...stations.find(station => station.id === stationId),
            collectedPercentage: collectedPercentage,
          });
        },
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

