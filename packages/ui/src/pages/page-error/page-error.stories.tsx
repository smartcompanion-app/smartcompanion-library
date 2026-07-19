import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { PageErrorFacade } from '../../contracts';
import { h } from '@stencil/core';
import { PageError } from './page-error';

const meta = {
  title: 'Pages/Page Error',
  tags: ['autodocs'],
  component: PageError,
  render: args => (<div style={{width: '100vw', height: '100vh'}}><sc-page-error {...args} /></div>),
} satisfies Meta<PageError>;

export default meta;

type Story = StoryObj<PageError>;

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
    } as PageErrorFacade,
  },
};

