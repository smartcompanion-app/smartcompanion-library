import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { PlayerControls } from './player-controls';

const meta = {
  title: 'Components/Player Controls',
  tags: ['autodocs'],
  component: PlayerControls,
  render: args => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw" }}>
    <sc-player-controls {...args} />
  </div>,
} satisfies Meta<PlayerControls>;

export default meta;

type Story = StoryObj<PlayerControls>;

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
