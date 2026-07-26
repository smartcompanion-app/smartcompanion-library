import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { Menu, StationListFacade, StationSource } from '../../contracts';
import { h } from '@stencil/core';
import { PageSelection } from './page-selection';

const meta = {
  title: 'Pages/Page Selection',
  tags: ['autodocs'],
  component: PageSelection,
  render: args => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <sc-page-selection {...args} />
    </div>
  ),
} satisfies Meta<PageSelection>;

export default meta;

type Story = StoryObj<PageSelection>;

export const Example: Story = {
  args: {
    facade: {
      getMenuService: () =>
        ({
          enable: () => {
            console.log('Menu enabled');
            return Promise.resolve();
          },
        }) as Menu,
      getStationService: () =>
        ({
          getStations: () => {
            return Promise.resolve([]);
          },
        }) as StationSource,
      __: (key: string) => {
        switch (key) {
          case 'menu-selection':
            return 'Station Selection';
          default:
            return key;
        }
      },
    } as StationListFacade,
  },
};
