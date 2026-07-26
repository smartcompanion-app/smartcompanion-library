import { render, expect, test, h } from '@stencil/vitest';
import { Loader, Menu, PageLoadingFacade, Router } from '../../contracts';

const facade = {
  getLoadService: () => ({
    setProgressListener: () => {},
    load: () => new Promise(() => {}),
    isLoaded: () => true,
  }) as Partial<Loader>,
  getMenuService: () => ({
    disable: () => Promise.resolve(),
  }) as Partial<Menu>,
  getRoutingService: () => ({
    addRouteChangeListener: () => {},
  }) as Partial<Router>,
  getPendingRoute: () => null,
} as unknown as PageLoadingFacade;

test('render page loading with spinner', async () => {
  const { root } = await render(
    <sc-page-loading image="assets/loading.png" facade={facade}></sc-page-loading>
  );
  expect(root).toMatchSnapshot();
});

test('render page loading with dark image', async () => {
  const { root } = await render(
    <sc-page-loading image="assets/loading.png" imageDark="assets/loading-dark.png" facade={facade}></sc-page-loading>
  );
  expect(root).toMatchSnapshot();
});
