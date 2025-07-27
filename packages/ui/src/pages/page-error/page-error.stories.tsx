import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';
import { PageError } from './page-error';

type StoryArgs = {
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Error',
  tags: ['autodocs'],
  component: PageError,
  render: args => (<div style={{width: '100vw', height: '100vh'}}><sc-page-error facade={args.facade as ServiceFacade} /></div>),
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Example: Story = {
  args: {
    facade: {      
      __: (key: string) => {
        switch (key) {
          case 'no-internet':
            return 'No Internet Connection';
          case 'try-again':
            return 'Try Again';
          default:
            return key;
        }
      },
    },
  },
};

