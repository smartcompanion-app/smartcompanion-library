import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { Numpad } from './numpad';

type StoryArgs = {
  full: boolean;
};

const meta: Meta<StoryArgs> = {
  title: 'Components/Numpad',
  tags: ['autodocs'],
  component: Numpad,
  render: args => <sc-numpad {...args} />,
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Example: Story = {
  args: {
    full: false,
  },
};

export const FullExample: Story = {
  args: {
    full: true,
  },
};
