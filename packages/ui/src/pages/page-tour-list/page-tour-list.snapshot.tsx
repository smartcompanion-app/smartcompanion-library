import { render, expect, test, h } from '@stencil/vitest';
import { Menu, PageTourListFacade, TourSource, TranslationKey } from '../../contracts';
import { tours } from '../../../test/fixtures';

const facade = {
  getMenuService: () =>
    ({
      enable: () => Promise.resolve(),
    }) as Partial<Menu>,
  getTourService: () =>
    ({
      getTours: () => Promise.resolve(tours),
    }) as Partial<TourSource>,
  __: (key: TranslationKey) => {
    switch (key) {
      case 'start-tour':
        return 'Start Tour';
      case 'menu-overview':
        return 'Tours';
      default:
        return key;
    }
  },
} as unknown as PageTourListFacade;

test('render page tour list', async () => {
  const { root } = await render(<sc-page-tour-list facade={facade}></sc-page-tour-list>);
  expect(root).toMatchSnapshot();
});

test('render page tour list for tours without images', async () => {
  const withoutImages = tours.map(tour => ({ ...tour, images: [] }));
  const facadeWithoutImages = {
    ...facade,
    getTourService: () => ({ getTours: () => Promise.resolve(withoutImages) }) as Partial<TourSource>,
  } as unknown as PageTourListFacade;

  const { root } = await render(<sc-page-tour-list facade={facadeWithoutImages}></sc-page-tour-list>);

  expect(root.querySelectorAll('.tour-card').length).toBe(tours.length);
});
