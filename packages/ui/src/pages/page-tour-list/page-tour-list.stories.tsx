import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { Menu, PageTourListFacade, TourSource } from '../../contracts';
import { h } from '@stencil/core';
import { PageTourList } from './page-tour-list';
import { tours } from '../../../test/fixtures';

const meta = {
  title: 'Pages/Page Tour List',
  tags: ['autodocs'],
  component: PageTourList,
  render: args => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <sc-page-tour-list {...args} />
    </div>
  ),
} satisfies Meta<PageTourList>;

export default meta;

type Story = StoryObj<PageTourList>;

export const Example: Story = {
  args: {
    facade: {
      getMenuService: () => ({
        enable: () => Promise.resolve(),
      }) as Menu,
      getTourService: () => ({
        getTours: () => {
          return Promise.resolve(tours);
        },
      }) as TourSource,
      __: (key: string) => {
        switch (key) {
          case 'menu-overview':
            return 'Tour Overview';
          case 'start-tour':
            return 'Start Tour';
          default:
            return key;
        }
      },
    } as PageTourListFacade,
  },
};
