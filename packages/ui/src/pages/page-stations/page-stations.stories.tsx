import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { AudioPlayerService, ServiceFacade, MenuService, CollectibleAudioPlayerService } from '@smartcompanion/services';
import { StationService } from '@smartcompanion/data';
import { stations } from '../../utils/test-utils';
import { PageStations } from './page-stations';


type StoryArgs = {
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Stations',
  tags: ['autodocs'],
  component: PageStations,
  render: args => (
    <div style={{width: "100vw", height: "100vh"}}>
      <sc-page-stations stationId={"default"} facade={args.facade as ServiceFacade} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

const audioPlayerService: AudioPlayerService = new CollectibleAudioPlayerService("");

export const Example: Story = {
  args: {
    facade: {
      getAudioPlayerService: () => audioPlayerService,
      getStationService: () => ({
        updateCollectedPercentage: (stationId: string, _: string, collectedPercentage: number) => {
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
    },
  },
};

