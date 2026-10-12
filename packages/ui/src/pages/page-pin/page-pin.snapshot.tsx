import { render, expect, test, h } from '@stencil/vitest';
import { Menu, PagePinFacade, PinValidator, Router, TranslationKey } from '../../contracts';

const facade = {
  getPinService: () =>
    ({
      validatePin: () => false,
    }) as Partial<PinValidator>,
  getMenuService: () =>
    ({
      disable: () => Promise.resolve(),
    }) as Partial<Menu>,
  getRoutingService: () =>
    ({
      replace: () => Promise.resolve(),
    }) as Partial<Router>,
  __: (key: TranslationKey) => {
    switch (key) {
      case 'enter-pin':
        return 'Enter PIN';
      case 'pin-error':
        return 'PIN was incorrect, please try again';
      default:
        return key;
    }
  },
} as unknown as PagePinFacade;

test('render page pin in initial state', async () => {
  const { root } = await render(<sc-page-pin facade={facade}></sc-page-pin>);
  expect(root).toMatchSnapshot();
});
