import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { PlayerControls } from './player-controls';

type StoryArgs = {
  position: number;
  duration: number;
  playing: boolean;
  disabled: boolean;
};

const meta: Meta<StoryArgs> = {
  title: 'Components/Player Controls',
  tags: ['autodocs'],
  component: PlayerControls,
  render: args => <sc-player-controls {...args} />,
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Example: Story = {
  args: {
    position: 50,
    duration: 250,
    playing: false,
    disabled: false,
  },
};

export const PlayDisabledExample: Story = {
  args: {
    position: 50,
    duration: 250,
    playing: false,
    disabled: true,
  },
};

export const KnobDisabledExample: Story = {
  args: {
    position: 0,
    duration: 0,
    playing: false,
    disabled: false,
  },
};
