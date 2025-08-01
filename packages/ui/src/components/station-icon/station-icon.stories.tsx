import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { StationIcon } from './station-icon';

type StoryArgs = {
  number: string;
  collected: boolean;
  collectedPercent: number;
};

const meta: Meta<StoryArgs> = {
  title: 'Components/Station Icon',
  tags: ['autodocs'],
  component: StationIcon,
  render: args => <sc-station-icon 
    collected={args.collected} 
    collected-percent={args.collectedPercent}>{args.number}</sc-station-icon>
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const BasicStationIcon: Story = {
  args: {
    number: '21',
    collectedPercent: 15,
    collected: false
  }
};

export const CollectedStationIcon: Story = {
  args: {
    number: '21',
    collectedPercent: 100,
    collected: true
  }
};
