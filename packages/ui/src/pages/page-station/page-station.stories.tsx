import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { Menu, PageStationFacade, StationSource, TourSource } from '../../contracts';
import { h } from '@stencil/core';
import { AudioPlayerService } from '@smartcompanion/services';
import { stations } from '../../../test/fixtures';
import { PageStation } from './page-station';

const meta = {
  title: 'Pages/Page Station',
  tags: ['autodocs'],
  component: PageStation,
  render: args => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <sc-page-station {...args} />
    </div>
  ),
} satisfies Meta<PageStation>;

export default meta;

type Story = StoryObj<PageStation>;

const audioPlayerService: AudioPlayerService = new AudioPlayerService('');

export const Example: Story = {
  args: {
    enableSwitchAudioOutput: false,
    facade: {
      getAudioPlayerService: () => audioPlayerService,
      getTourService: () =>
        ({
          getStations: (_: string) => {
            return Promise.resolve(stations);
          },
        }) as TourSource,
      getStationService: () =>
        ({
          getStations: () => {
            return Promise.resolve(stations);
          },
        }) as StationSource,
      getMenuService: () =>
        ({
          enable: () => Promise.resolve(),
        }) as Menu,
    } as PageStationFacade,
  },
};
