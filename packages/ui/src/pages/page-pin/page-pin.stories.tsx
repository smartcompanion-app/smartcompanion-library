import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { PinService } from '@smartcompanion/data';
import { ServiceFacade, MenuService, RoutingService } from '@smartcompanion/services';
import { PagePin } from './page-pin';

type StoryArgs = {
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Pin',
  tags: ['autodocs'],
  component: PagePin,
  render: args => (
    <div style={{width: '100vw', height: '100vh'}}>
      <sc-page-pin facade={args.facade as ServiceFacade} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

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
          case 'enter_pin':
            return 'Enter PIN';
          case 'pin_error':
            return 'PIN was incorrect, please try again';
          default:
            return key;
        }
      },
    },    
  },
};

