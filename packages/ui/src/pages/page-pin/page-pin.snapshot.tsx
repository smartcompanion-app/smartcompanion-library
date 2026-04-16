import { render, expect, test, h } from '@stencil/vitest';
import { ServiceFacade, MenuService, RoutingService } from '@smartcompanion/services';
import { PinService } from '@smartcompanion/data';

const facade = {
  getPinService: () => ({
    validatePin: () => false,
  }) as Partial<PinService>,
  getMenuService: () => ({
    disable: () => Promise.resolve(),
  }) as Partial<MenuService>,
  getRoutingService: () => ({
    pushReplaceCurrent: () => Promise.resolve(),
  }) as Partial<RoutingService>,
  __: (key: string) => {
    switch (key) {
      case 'enter-pin': return 'Enter PIN';
      case 'pin-error': return 'PIN was incorrect, please try again';
      default: return key;
    }
  },
} as unknown as ServiceFacade;

test('render page pin in initial state', async () => {
  const { root } = await render(<sc-page-pin facade={facade}></sc-page-pin>);
  expect(root).toMatchSnapshot();
});
