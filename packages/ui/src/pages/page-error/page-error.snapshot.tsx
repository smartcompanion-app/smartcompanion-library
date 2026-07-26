import { render, expect, test, h } from '@stencil/vitest';
import { Menu, PageErrorFacade } from '../../contracts';

const facade = {
  getMenuService: () =>
    ({
      disable: () => Promise.resolve(),
    }) as Partial<Menu>,
  __: (key: string) => {
    switch (key) {
      case 'no-internet':
        return 'No Internet Connection';
      case 'try-again':
        return 'Try Again';
      default:
        return key;
    }
  },
} as unknown as PageErrorFacade;

test('render page error', async () => {
  const { root } = await render(<sc-page-error facade={facade}></sc-page-error>);
  expect(root).toMatchSnapshot();
});
