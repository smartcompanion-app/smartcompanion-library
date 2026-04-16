import { render, expect, test, h } from '@stencil/vitest';
import { ServiceFacade, MenuService, RoutingService } from '@smartcompanion/services';
import { LoadService } from '@smartcompanion/data';

const facade = {
  getLoadService: () => ({
    setProgressListener: () => {},
    load: () => new Promise(() => {}),
    isLoaded: () => true,
  }) as Partial<LoadService>,
  getMenuService: () => ({
    disable: () => Promise.resolve(),
  }) as Partial<MenuService>,
  getRoutingService: () => ({
    addRouteChangeListener: () => {},
  }) as Partial<RoutingService>,
  getPendingRoute: () => null,
} as unknown as ServiceFacade;

test('render page loading with spinner', async () => {
  const { root } = await render(
    <sc-page-loading image="assets/loading.png" facade={facade}></sc-page-loading>
  );
  expect(root).toMatchSnapshot();
});
