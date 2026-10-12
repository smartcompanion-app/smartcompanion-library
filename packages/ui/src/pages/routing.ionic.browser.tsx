import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { RoutingService } from '@smartcompanion/services';
import { Menu, StationListFacade, TourSource } from '../contracts';
import { stations } from '../../test/fixtures';

// Navigation against a real Ionic 9, which vitest.setup.ionic.ts loads for
// *.ionic.browser.tsx specs only. Every other spec sees the ion-* elements as
// undefined.
//
// Ionic 9 removed the integration between ion-router and ion-nav, which the apps
// had used since Ionic 4: under it ion-nav stays empty and the app renders
// nothing. The apps now route into ion-router-outlet, which holds one page, so
// the page stack is the browser history and RoutingService keeps track of how
// far back it reaches. The routes mirror festung-kufstein-app, the app with the
// deepest navigation: a station list is reachable from both the tour list and
// the map, and its back button falls back to /tours.

for (const tag of ['test-page-tours', 'test-page-map', 'test-page-station']) {
  customElements.define(
    tag,
    class extends HTMLElement {
      connectedCallback() {
        this.classList.add('ion-page');
        this.innerHTML = `<ion-content>${tag}</ion-content>`;
      }
    },
  );
}

let routing: RoutingService;

const facade = {
  getMenuService: () => ({ enable: () => Promise.resolve(), disable: () => Promise.resolve() }) as Partial<Menu>,
  getRoutingService: () => routing,
  getTourService: () => ({ getStations: () => Promise.resolve(stations) }) as Partial<TourSource>,
  getStationService: () => ({ getStations: () => Promise.resolve(stations) }),
  __: (key: string) => key,
} as unknown as StationListFacade;

const page = () => document.querySelector('ion-router-outlet > .ion-page:not(.ion-page-hidden)')?.tagName.toLowerCase();
const path = () => location.hash.replace(/^#/, '');

const showing = async (tag: string, hash: string) => {
  await expect.poll(page).toBe(tag);
  expect(path()).toBe(hash);
};

const clickBackButton = async () => {
  const button = document.querySelector('sc-page-station-list ion-back-button') as HTMLElement;
  // Ionic hides a back button that has neither an ion-nav to pop nor a
  // default-href; menu-utils sets `#` to keep it shown
  await expect.poll(() => button.classList.contains('show-back-button')).toBe(true);
  button.click();
};

// The app shell is set up once, as in an app. A second ion-router would not
// replace the first: Ionic adds its window listeners for route changes without
// ever removing them, so a detached router keeps rendering into the outlet.
beforeAll(async () => {
  history.replaceState(null, '', '#/tours');
  document.body.innerHTML = `
    <ion-app>
      <ion-router use-hash="true">
        <ion-route url="/tours" component="test-page-tours"></ion-route>
        <ion-route url="/map" component="test-page-map"></ion-route>
        <ion-route url="/tours/:tourId" component="sc-page-station-list"></ion-route>
        <ion-route url="/tours/:tourId/stations/:stationId" component="test-page-station"></ion-route>
      </ion-router>
      <ion-router-outlet id="main" animated="false"></ion-router-outlet>
    </ion-app>`;
  (document.querySelector('ion-route[url="/tours/:tourId"]') as HTMLElement & { componentProps: object }).componentProps = { facade };
  await vi.waitFor(() => expect(page()).toBe('test-page-tours'));
});

// Each test starts on /tours with a service that has not navigated yet, so
// there is nothing to go back to.
beforeEach(async () => {
  await new RoutingService().replace('/tours');
  await showing('test-page-tours', '/tours');
  routing = new RoutingService();
});

describe('routing on ion-router-outlet', () => {
  it('renders the routed page, which ion-router with ion-nav no longer does', async () => {
    await routing.push('/tours/1');
    await showing('sc-page-station-list', '/tours/1');
  });

  it('returns to the page the list was opened from, not to the fallback', async () => {
    await routing.replace('/map');
    await routing.push('/tours/1');
    await showing('sc-page-station-list', '/tours/1');
    expect(routing.canGoBack()).toBe(true);

    await clickBackButton();
    await showing('test-page-map', '/map');
    expect(routing.canGoBack()).toBe(false);
  });

  it('uses the fallback when the list was opened directly, e.g. from a deep link', async () => {
    await routing.replace('/tours/1');
    await showing('sc-page-station-list', '/tours/1');
    expect(routing.canGoBack()).toBe(false);

    await clickBackButton();
    await showing('test-page-tours', '/tours');
  });

  it('pushes a station from the list and comes back to the list', async () => {
    await routing.push('/tours/1');
    await showing('sc-page-station-list', '/tours/1');
    await expect.poll(() => document.querySelectorAll('sc-page-station-list ion-item').length).toBe(stations.length);

    (document.querySelector('sc-page-station-list ion-item[data-station-id="2"]') as HTMLElement).click();
    await showing('test-page-station', '/tours/1/stations/2');

    await routing.back();
    await showing('sc-page-station-list', '/tours/1');
    expect(routing.canGoBack()).toBe(true);
  });

  it('does not let back return to a replaced page', async () => {
    await routing.push('/map');
    await routing.push('/tours/1');
    await routing.replace('/tours/1/stations/3');
    await showing('test-page-station', '/tours/1/stations/3');

    await routing.back();
    await showing('test-page-map', '/map');
  });

  it('replaces the history entry with a forward transition, as under ion-nav', async () => {
    // The outlet is told the direction; `root`, the only one ion-router itself
    // replaces the entry for, renders without a transition.
    const outlet = document.querySelector('ion-router-outlet') as HTMLElement & { setRouteId(...args: unknown[]): Promise<unknown> };
    const setRouteId = outlet.setRouteId;
    const directions: unknown[] = [];
    // Stencil defines the method read-only on the prototype, so it is
    // shadowed on the instance rather than assigned
    Object.defineProperty(outlet, 'setRouteId', {
      configurable: true,
      value: (...args: unknown[]) => {
        directions.push(args[2]);
        return setRouteId.apply(outlet, args);
      },
    });

    try {
      const length = history.length;
      await routing.replace('/map');
      await showing('test-page-map', '/map');

      expect(directions).toEqual(['forward']);
      expect(history.length).toBe(length);
      expect(Object.prototype.hasOwnProperty.call(history, 'pushState')).toBe(false);
    } finally {
      delete (outlet as { setRouteId?: unknown }).setRouteId;
    }

    // and a push right after it adds an entry again
    await routing.push('/tours/1');
    await routing.back();
    await showing('test-page-map', '/map');
  });

  it('follows a back navigation it did not start, like the Android back button', async () => {
    await routing.push('/map');
    await showing('test-page-map', '/map');
    expect(routing.canGoBack()).toBe(true);

    history.back();
    await showing('test-page-tours', '/tours');
    expect(routing.canGoBack()).toBe(false);

    history.forward();
    await showing('test-page-map', '/map');
    expect(routing.canGoBack()).toBe(true);
  });

  it('counts going back to the page the app was opened on as a step back', async () => {
    // The opening entry has no history.state until ion-router numbers it in its
    // own popstate listener, which runs before the service's.
    history.replaceState(null, '', location.href);
    await routing.push('/map');
    await showing('test-page-map', '/map');

    history.back();
    await showing('test-page-tours', '/tours');
    expect(routing.canGoBack()).toBe(false);
  });
});
