import { render, expect, test, h } from '@stencil/vitest';
import { tours } from '../../../test/fixtures';
import { ServiceFacade, MenuService } from '@smartcompanion/services';
import { TourService } from '@smartcompanion/data';

const facade = {
  getMenuService: () => ({
    enable: () => Promise.resolve(),
  }) as Partial<MenuService>,
  getTourService: () => ({
    getTours: () => Promise.resolve(tours),
  }) as Partial<TourService>,
  __: (key: string) => {
    switch (key) {
      case 'tour-list': return 'Tour Overview';
      case 'start-tour': return 'Start Tour';
      case 'menu-overview': return 'Tours';
      default: return key;
    }
  },
} as unknown as ServiceFacade;

test('render page tour list', async () => {
  const { root } = await render(<sc-page-tour-list facade={facade}></sc-page-tour-list>);
  expect(root).toMatchSnapshot();
});
