import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { StationIcon } from './station-icon';

type StoryArgs = {
  number: string;
  collected: boolean;
  collectedPercent: number;
  size: 'normal' | 'large';
};

const meta: Meta<StoryArgs> = {
  title: 'Components/Station Icon',
  tags: ['autodocs'],
  component: StationIcon,
  render: args => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw" }}>
    <sc-station-icon
      size={args.size}
      collected={args.collected} 
      collected-percent={args.collectedPercent}>{args.number}</sc-station-icon>
  </div>
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const BasicStationIcon: Story = {
  args: {
    number: '21',
    collectedPercent: 15,
    collected: false,
    size: 'normal'
  }
};

export const CollectedStationIcon: Story = {
  args: {
    number: '21',
    collectedPercent: 100,
    collected: true,
    size: 'normal'
  }
};

export const LargeStationIcon: Story = {
  args: {
    number: '21',
    collectedPercent: 60,
    collected: false,
    size: 'large'
  }
};

export const LargeCollectedStationIcon: Story = {
  args: {
    number: '21',
    collectedPercent: 100,
    collected: true,
    size: 'large'
  }
};
