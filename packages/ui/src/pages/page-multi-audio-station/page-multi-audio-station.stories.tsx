import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { Menu, Router, PageMultiAudioStationFacade, StationSource } from '../../contracts';
import { h } from '@stencil/core';
import { AudioPlayerService } from '@smartcompanion/services';
import { PageMultiAudioStation } from './page-multi-audio-station';
import { getMultiAudioStation } from '../../../test/fixtures';

const meta = {
  title: 'Pages/Page Multi Audio Station',
  tags: ['autodocs'],
  component: PageMultiAudioStation,
  render: args => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <sc-page-multi-audio-station {...args} />
    </div>
  ),
} satisfies Meta<PageMultiAudioStation>;

export default meta;

type Story = StoryObj<PageMultiAudioStation>;

const audioPlayerService: AudioPlayerService = new AudioPlayerService('');

export const Example: Story = {
  args: {
    enableSwitchAudioOutput: true,
    stationId: '123',
    facade: {
      getAudioPlayerService: () => audioPlayerService,
      getMenuService: () =>
        ({
          enable: () => Promise.resolve(),
        }) as Menu,
      getStationService: () =>
        ({
          getStation: (_: string) => {
            return Promise.resolve(getMultiAudioStation());
          },
        }) as StationSource,
      getRoutingService: () =>
        ({
          back: (fallbackUri?: string) => {
            console.log(`Go back, or to ${fallbackUri ?? '/'}`);
            return Promise.resolve();
          },
        }) as Router,
      __: (key: string) => {
        switch (key) {
          case 'station-list':
            return 'Station Overview';
          default:
            return key;
        }
      },
    } as PageMultiAudioStationFacade,
  },
};
