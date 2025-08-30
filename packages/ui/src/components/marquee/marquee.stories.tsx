import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { Marquee } from './marquee';

type StoryArgs = {
  active: boolean;
  text: string;
};

const meta: Meta<StoryArgs> = {
  title: 'Components/Marquee',
  tags: ['autodocs'],
  component: Marquee,
  render: args => <div style={{ width: "100vw" }}>
    <sc-marquee active={args.active}>{args.text}</sc-marquee>
  </div>,
};

export default meta;

type Story = StoryObj<StoryArgs>;


export const Example: Story = {
  args: {
    active: false,
    text: 'A beatiful text, which however is too long for the width. A beatiful text, which however is too long for the width.',
  },
};

export const ActiveExample: Story = {
  args: {
    active: true,
    text: 'A beatiful text, which however is too long for the width. A beatiful text, which however is too long for the width.',
  },
};

export const ActiveShortExample: Story = {
  args: {
    active: true,
    text: 'Short Text',
  },
};
