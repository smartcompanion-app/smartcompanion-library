import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { ServiceFacade, MenuService } from '@smartcompanion/services';
import { PageSelection } from './page-selection';

type StoryArgs = {
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Selection',
  tags: ['autodocs'],
  component: PageSelection,
  render: args => (
    <div style={{width: "320px", height: "500px", border: "1px solid #efefef"}}>
      <sc-page-selection facade={args.facade as ServiceFacade} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Example: Story = {
  args: {
    facade: {      
      getMenuService: () => ({
        enable: () => {
          console.log('Menu enabled');
          return Promise.resolve();
        },
      }) as MenuService,
      __: (key: string) => {
        switch (key) {
          case 'menu-selection':
            return 'Station Selection';
          default:
            return key;
        }
      },
    },
  },
};

