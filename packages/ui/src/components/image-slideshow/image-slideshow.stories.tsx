import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { Asset } from '@smartcompanion/data';
import { stations } from '../../../test/fixtures';
import { ImageSlideshow } from './image-slideshow';

type StoryArgs = {
  images: string[];
};

const meta: Meta<StoryArgs> = {
  title: 'Components/Image Slideshow',
  tags: ['autodocs'],
  component: ImageSlideshow,
  render: args => <div style={{ width: "100vw" }}>
    <sc-image-slideshow {...args} />
  </div>,
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const MultiImageExample: Story = {
  args: {
    images: [
      (stations[0].images[0] as Asset).internalWebUrl,
      (stations[1].images[0] as Asset).internalWebUrl,
      (stations[2].images[0] as Asset).internalWebUrl,
    ],
  },
};

export const SingleImageExample: Story = {
  args: {
    images: [(stations[0].images[0] as Asset).internalWebUrl],
  },
};

