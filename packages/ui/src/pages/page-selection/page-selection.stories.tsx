import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { ServiceFacade, MenuService } from '@smartcompanion/services';
import { PageSelection } from './page-selection';
import { StationService } from '@smartcompanion/data';

const meta = {
  title: 'Pages/Page Selection',
  tags: ['autodocs'],
  component: PageSelection,
  render: args => (
    <div style={{width: "100vw", height: "100vh"}}>
      <sc-page-selection {...args} />
    </div>
  ),
} satisfies Meta<PageSelection>;

export default meta;

type Story = StoryObj<PageSelection>;

export const Example: Story = {
  args: {
    facade: {      
      getMenuService: () => ({
        enable: () => {
          console.log('Menu enabled');
          return Promise.resolve();
        },
      }) as MenuService,
      getStationService: () => ({
        getStations: () => {
          return Promise.resolve([]);
        },
      }) as StationService,
      __: (key: string) => {
        switch (key) {
          case 'menu-selection':
            return 'Station Selection';
          default:
            return key;
        }
      },
    } as ServiceFacade,
  },
};

