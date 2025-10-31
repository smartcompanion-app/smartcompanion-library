import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { Marquee } from './marquee';

const createRender = (text: string) => {
  return args => <div style={{ width: "100vw" }}>
    <sc-marquee {...args}>{text}</sc-marquee>
  </div>;
}

const meta = {
  title: 'Components/Marquee',
  tags: ['autodocs'],
  component: Marquee,
} satisfies Meta<Marquee>;

export default meta;

type Story = StoryObj<Marquee>;

export const Example: Story = {
  args: {
    active: false,
  },
  render: createRender('This is an example of a very long text that will scroll across the screen when the marquee is active.'),
};

export const ActiveExample: Story = {
  args: {
    active: true,
  },
  render: createRender('This is an example of a very long text that will scroll across the screen when the marquee is active.'),
};

export const ActiveShortExample: Story = {
  args: {
    active: true,
  },
  render: createRender('Short Text'),
};
