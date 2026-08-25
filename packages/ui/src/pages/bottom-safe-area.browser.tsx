import { render, h, describe, it, expect } from '@stencil/vitest';
import {
  Menu,
  PageErrorFacade,
  PageLanguageFacade,
  PagePinFacade,
  PageStationFacade,
  PageTourListFacade,
  PinValidator,
  Router,
  StationListFacade,
  StationSource,
  TourSource,
} from '../contracts';
import { AudioPlayerService } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';
import { stations as fixtureStations, tours } from '../../test/fixtures';

// Regression test for #101, generalizing the one #96 added for sc-page-stations
// (which keeps its own, next to the swiper assertions it also needs).
//
// Under an edge-to-edge WebView Ionic applies the bottom safe-area inset only in
// the components that own the bottom edge; `ion-content` gets nothing outside a
// modal, so a routed page's content ran under the Android navigation bar and its
// lowest element was obscured. Each page now sets `--padding-bottom` on its
// `ion-content` -- see src/styles/_safe-area.scss.
//
// The assertion is on the computed custom property rather than on the padding of
// `.inner-scroll`: this project does not load @ionic/core into the browser
// project (see vitest.setup.ts), so `ion-content` is an undefined element with no
// shadow root. `getComputedStyle` still substitutes `var()` for custom
// properties, which is what makes the two halves below meaningful.

const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const stations: Station[] = fixtureStations.map(station => ({
  ...station,
  audios: station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO })),
}));

const menu = () => ({ enable: () => Promise.resolve(), disable: () => Promise.resolve() }) as Partial<Menu>;
const stationSource = () => ({ getStations: () => Promise.resolve(stations) }) as Partial<StationSource>;
const translate = (key: string) => key;

const stationListFacade = {
  getMenuService: menu,
  getStationService: stationSource,
  getTourService: () => ({ getStations: () => Promise.resolve(stations) }) as Partial<TourSource>,
  __: translate,
} as unknown as StationListFacade;

const tourListFacade = {
  getMenuService: menu,
  getTourService: () => ({ getTours: () => Promise.resolve(tours) }) as Partial<TourSource>,
  __: translate,
} as unknown as PageTourListFacade;

// One instance, not one per call: ReactiveAudioPlayer.initAudioPlayer() calls
// start() and then select() through separate getAudioPlayerService() calls, and
// a fresh instance for the second has no items -- select() then rejects with
// "Item with id  doesn't exist" outside the page's own promise chain.
const audioPlayerService = new AudioPlayerService('');

const stationFacade = {
  getAudioPlayerService: () => audioPlayerService,
  getMenuService: menu,
  getStationService: stationSource,
  getTourService: () => ({ getStations: () => Promise.resolve(stations) }) as Partial<TourSource>,
  __: translate,
} as unknown as PageStationFacade;

const pinFacade = {
  getPinService: () => ({ validatePin: () => false }) as Partial<PinValidator>,
  getMenuService: menu,
  getRoutingService: () => ({ pushReplaceCurrent: () => Promise.resolve() }) as Partial<Router>,
  __: translate,
} as unknown as PagePinFacade;

const errorFacade = {
  getMenuService: menu,
  getRoutingService: () => ({ pushReplaceCurrent: () => Promise.resolve() }) as Partial<Router>,
  __: translate,
} as unknown as PageErrorFacade;

const languageFacade = {
  getMenuService: menu,
  getLanguages: () => [{ title: 'English', language: 'en' }],
} as unknown as PageLanguageFacade;

// `base` is the bottom padding the page already wanted, which the inset is added
// to rather than replacing. Only sc-page-language has one today; where there is
// none the computed value is the inset itself, so the assertions read as lengths.
type PageUnderTest = {
  name: string;
  base?: string;
  renderPage: () => Promise<HTMLElement>;
  content: (root: HTMLElement) => HTMLElement | null;
};

const renderer = (node: () => unknown) => async () => {
  const { root, waitForChanges } = await render(node() as never);
  await waitForChanges();
  return root;
};

const light = (root: HTMLElement) => root.querySelector('ion-content') as HTMLElement | null;
// sc-page-error and sc-page-language are `shadow: true`, so their stylesheet is
// scoped for them and its selector needs no host tag -- and their ion-content is
// reachable only through the shadow root.
const shadow = (root: HTMLElement) => root.shadowRoot.querySelector('ion-content') as HTMLElement | null;

const pages: PageUnderTest[] = [
  { name: 'sc-page-station-list', renderPage: renderer(() => <sc-page-station-list facade={stationListFacade}></sc-page-station-list>), content: light },
  { name: 'sc-page-station-image-list', renderPage: renderer(() => <sc-page-station-image-list facade={stationListFacade}></sc-page-station-image-list>), content: light },
  { name: 'sc-page-tour-list', renderPage: renderer(() => <sc-page-tour-list facade={tourListFacade}></sc-page-tour-list>), content: light },
  { name: 'sc-page-station', renderPage: renderer(() => <sc-page-station stationId="1" facade={stationFacade}></sc-page-station>), content: light },
  { name: 'sc-page-pin', renderPage: renderer(() => <sc-page-pin facade={pinFacade}></sc-page-pin>), content: light },
  { name: 'sc-page-error', renderPage: renderer(() => <sc-page-error facade={errorFacade}></sc-page-error>), content: shadow },
  { name: 'sc-page-language', base: '12px', renderPage: renderer(() => <sc-page-language facade={languageFacade}></sc-page-language>), content: shadow },
];

// An unregistered custom property computes to its substituted token stream, not
// to an evaluated length, so a page with a base reads back as the calc() itself.
const expected = (base: string | undefined, inset: string) => (base === undefined ? inset : `calc(${base} + ${inset})`);

const paddingBottom = async (page: PageUnderTest, inset?: string) => {
  const root = await page.renderPage();

  if (inset !== undefined) {
    document.documentElement.style.setProperty('--ion-safe-area-bottom', inset);
  }

  try {
    const content = page.content(root);
    // Without this, a markup change that drops the content surfaces as a
    // getComputedStyle TypeError rather than as the test below failing.
    expect(content, `${page.name} should render an ion-content`).not.toBeNull();
    return getComputedStyle(content!).getPropertyValue('--padding-bottom').trim();
  } finally {
    document.documentElement.style.removeProperty('--ion-safe-area-bottom');
    root.remove();
  }
};

describe('bottom safe-area inset', () => {
  for (const page of pages) {
    describe(page.name, () => {
      it('should keep the content clear of the navigation bar', async () => {
        expect(await paddingBottom(page, '48px')).toBe(expected(page.base, '48px'));
      });

      // Browsers and Storybook report no inset, where the rule has to be inert.
      it('should not reserve space where there is no inset', async () => {
        expect(await paddingBottom(page)).toBe(expected(page.base, '0px'));
      });
    });
  }
});
