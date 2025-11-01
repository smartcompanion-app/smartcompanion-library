import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { MenuService, ServiceFacade } from '@smartcompanion/services';
import { TourService } from '@smartcompanion/data';
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
      }) as MenuService,
      getTourService: () => ({
        getTours: () => {
          return Promise.resolve(tours);
        },
      }) as TourService,
      __: (key: string) => {
        switch (key) {
          case 'tour-list':
            return 'Tour Overview';
          case 'start-tour':
            return 'Start Tour';
          default:
            return key;
        }
      },
    } as ServiceFacade,
  },
};
