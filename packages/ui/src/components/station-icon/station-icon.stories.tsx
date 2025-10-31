import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { StationIcon } from './station-icon';

const meta = {
  title: 'Components/Station Icon',
  tags: ['autodocs'],
  component: StationIcon,
  render: args => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw" }}>
    <sc-station-icon
      size={args.size}
      collected={args.collected} 
      collected-percent={args.collectedPercent}>21</sc-station-icon>
  </div>
} satisfies Meta<StationIcon>;

export default meta;

type Story = StoryObj<StationIcon>;

export const SmallStationIcon: Story = {
  args: {
    size: 'small',
  }
};

export const BasicStationIcon: Story = {
  args: {
    collectedPercent: 15,
    collected: false,
    size: 'normal'
  }
};

export const CollectedStationIcon: Story = {
  args: {
    collectedPercent: 100,
    collected: true,
    size: 'normal'
  }
};

export const LargeStationIcon: Story = {
  args: {
    collectedPercent: 60,
    collected: false,
    size: 'large'
  }
};

export const LargeCollectedStationIcon: Story = {
  args: {
    collectedPercent: 100,
    collected: true,
    size: 'large'
  }
};
