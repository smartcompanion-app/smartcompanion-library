import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { PinService } from '@smartcompanion/data';
import { ServiceFacade, MenuService, RoutingService } from '@smartcompanion/services';
import { PagePin } from './page-pin';

const meta = {
  title: 'Pages/Page Pin',
  tags: ['autodocs'],
  component: PagePin,
  render: args => (
    <div style={{width: '100vw', height: '100vh'}}>
      <sc-page-pin {...args} />
    </div>
  ),
} satisfies Meta<PagePin>;

export default meta;

type Story = StoryObj<PagePin>;

export const Example: Story = {
  args: {
    facade: {      
      getPinService: () => ({
        validatePin: (pin: string, validHours: number): boolean => {
          console.log(`Validating pin: ${pin} for ${validHours} hours`);
          return pin === "1234";
        }
      }) as PinService,
      getMenuService: () => ({
        disable: () => {
          console.log('Menu disabled');
          return Promise.resolve();
        },
      }) as MenuService,
      getRoutingService: () => ({
        pushReplaceCurrent: (route: string) => {
          console.log(`Move to route ${route}`);        
          return Promise.resolve();
        },
      }) as RoutingService,
      __: (key: string) => {
        switch (key) {
          case 'enter-pin':
            return 'Enter PIN';
          case 'pin-error':
            return 'PIN was incorrect, please try again';
          default:
            return key;
        }
      },
    } as ServiceFacade,
  },
};

