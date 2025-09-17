import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { MenuService, ServiceFacade } from '@smartcompanion/services';
import { TourService } from '@smartcompanion/data';
import { PageTourList } from './page-tour-list';
import { tours } from '../../../test/fixtures';

type StoryArgs = {
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Tour List',
  tags: ['autodocs'],
  component: PageTourList,
  render: args => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <sc-page-tour-list facade={args.facade as ServiceFacade} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

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
    },
  },
};
