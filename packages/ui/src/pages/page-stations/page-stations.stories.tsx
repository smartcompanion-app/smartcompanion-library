import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { expect, waitFor } from 'storybook/test';
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
  play: async ({ canvas, userEvent, step }) => {

    await new Promise(resolve => setTimeout(resolve, 500));
    
    await step('Last item active, when click prev from first item', async () => {
      // @ts-ignore
      const prevButton = await canvas.findByShadowTestId('player-prev-button');
      await userEvent.click(prevButton);
      
      await waitFor(() => {
        // @ts-ignore
        const firstListItem = canvas.getByShadowTestId('player-list-item-2');
        expect(firstListItem.classList.contains('active')).toBe(true);
      }, { timeout: 500 });
    });

    await step('First item active, when click next from last item', async () => {
      // @ts-ignore
      const nextButton = await canvas.findByShadowTestId('player-next-button');
      await userEvent.click(nextButton);

      await waitFor(() => {
        // @ts-ignore
        const firstListItem = canvas.getByShadowTestId('player-list-item-0');
        expect(firstListItem.classList.contains('active')).toBe(true);
      }, { timeout: 500 });
    });
  }
};

