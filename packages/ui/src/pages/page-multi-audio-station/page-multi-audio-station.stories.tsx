import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { MenuService, ServiceFacade, AudioPlayerService } from '@smartcompanion/services';
import { StationService } from '@smartcompanion/data';
import { PageMultiAudioStation } from './page-multi-audio-station';
import { getMultiAudioStation } from '../../../test/fixtures';

const meta = {
  title: 'Pages/Page Multi Audio Station',
  tags: ['autodocs'],
  component: PageMultiAudioStation,
  render: args => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <sc-page-multi-audio-station {...args} />
    </div>
  ),
} satisfies Meta<PageMultiAudioStation>;

export default meta;

type Story = StoryObj<PageMultiAudioStation>;

const audioPlayerService: AudioPlayerService = new AudioPlayerService("");

export const Example: Story = {
  args: {
    enableSwitchAudioOutput: true,
    stationId: "123",
    facade: {
      getAudioPlayerService: () => audioPlayerService,
      getMenuService: () => ({
        enable: () => Promise.resolve(),
      }) as MenuService,
      getStationService: () => ({
        getStation: (_: string) => {
          return Promise.resolve(getMultiAudioStation());
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
  play: async ({ canvas, userEvent, step }) => {

    await new Promise(resolve => setTimeout(resolve, 500));
    
    await step('Last item active, when click prev from first item', async () => {
      // @ts-ignore
      const prevButton = await canvas.findByShadowTestId('player-prev-button');
      await userEvent.click(prevButton);
      
      await waitFor(() => {
        // @ts-ignore
        const lastListItem = canvas.getByShadowTestId('audio-item-2');
        expect(lastListItem.classList.contains('active')).toBe(true);
      }, { timeout: 500 });
    });

    await step('First item active, when click next from last item', async () => {
      // @ts-ignore
      const nextButton = await canvas.findByShadowTestId('player-next-button');
      await userEvent.click(nextButton);

      await waitFor(() => {
        // @ts-ignore
        const firstListItem = canvas.getByShadowTestId('audio-item-0');
        expect(firstListItem.classList.contains('active')).toBe(true);
      }, { timeout: 500 });
    });

  },
};

