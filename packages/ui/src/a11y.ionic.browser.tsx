import { render, h, describe, it, expect } from '@stencil/vitest';
import axe from 'axe-core';
import { AudioPlayerService, CollectibleAudioPlayerService } from '@smartcompanion/services';
import { Asset, Station } from '@smartcompanion/data';
import { PageLanguageFacade, PageLoadingFacade, PageMultiAudioStationFacade, PagePinFacade, PageStationFacade, PageTourListFacade, StationListFacade } from './contracts';
import { stations as fixtureStations, tours } from '../test/fixtures';

// Accessibility baseline: every component and page, rendered in a real Ionic and
// checked with axe-core. Without Ionic the ion-* elements stay undefined, so an
// ion-fab-button would not be a button at all and axe would have nothing to
// judge -- hence an *.ionic.browser.tsx spec.
//
// Each case snapshots the violations it has today. A new violation fails the
// test; fixing one fails it too, until the snapshot is updated -- so the
// snapshot is the list of known issues, and the diff of a fix shows what it
// removed.
//
// Colour contrast is judged against Ionic's default palette: apps set their own
// colours, so contrast has to be checked again in an app.

const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const stations: Station[] = fixtureStations.map(station => ({
  ...station,
  audios: station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO })),
}));

// One station with every track, for sc-page-multi-audio-station
const multiAudioStation: Station = { ...stations[0], id: 'multi', audios: stations.flatMap(station => station.audios as Asset[]) };

const noop = () => Promise.resolve();

// One facade for every page; each page reads only its own slice of it.
type Facade = PageLanguageFacade & PageLoadingFacade & PageMultiAudioStationFacade & PagePinFacade & PageStationFacade & PageTourListFacade & StationListFacade;

const facade = (audioPlayer: AudioPlayerService = new AudioPlayerService('')): Facade =>
  ({
    __: (key: string) => key,
    getMenuService: () => ({ enable: noop, disable: noop, open: noop }),
    getRoutingService: () => ({ push: noop, replace: noop, back: noop, addRouteChangeListener: () => {} }),
    getStationService: () => ({
      getStations: () => Promise.resolve(stations),
      getStation: (id: string) => Promise.resolve(id === 'multi' ? multiAudioStation : stations.find(station => station.id === id)),
      updateCollectedPercentage: (id: string) => Promise.resolve(stations.find(station => station.id === id)),
    }),
    getTourService: () => ({
      getTours: () => Promise.resolve(tours),
      getDefaultTour: () => Promise.resolve(tours[0]),
      getStations: () => Promise.resolve(stations),
    }),
    getAudioPlayerService: () => audioPlayer,
    getLoadService: () => ({ setProgressListener: () => {}, load: () => new Promise(() => {}) }),
    getPendingRoute: () => null,
    getPinService: () => ({ validatePin: () => false }),
    getLanguages: () => [
      { title: 'English', language: 'en' },
      { title: 'Deutsch', language: 'de' },
    ],
    changeLanguage: () => {},
  }) as unknown as Facade;

// Rules about the document as a whole: landmarks, the h1, the title. A page is
// one element inside an app's shell, which is where those belong.
const documentRules = ['region', 'landmark-one-main', 'page-has-heading-one'];

const violations = async (root: Element) => {
  const results = await axe.run(root, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    rules: Object.fromEntries(documentRules.map(rule => [rule, { enabled: false }])),
    resultTypes: ['violations'],
  });
  return results.violations.map(violation => ({
    rule: `${violation.id} (${violation.impact}): ${violation.help}`,
    nodes: violation.nodes.map(node => node.target.map(String).join(' >>> ')),
  }));
};

// Data arrives a few microtasks after componentDidLoad, and Ionic hydrates its
// elements in turn; wait until every ion-* element below root has hydrated.
const settled = async (result: Awaited<ReturnType<typeof render>>) => {
  await result.waitForChanges();
  await new Promise(resolve => setTimeout(resolve, 100));
  await result.waitForChanges();
  const ionic = (node: Element | ShadowRoot): Element[] =>
    Array.from(node.querySelectorAll('*')).flatMap(element => [
      ...(element.tagName.startsWith('ION-') ? [element] : []),
      ...(element.shadowRoot !== null ? ionic(element.shadowRoot) : []),
    ]);
  await expect.poll(() => ionic(result.root).every(element => element.classList.contains('hydrated'))).toBe(true);
  return result.root;
};

const cases: Array<[string, () => ReturnType<typeof render>]> = [
  ['sc-player-controls', () => render(<sc-player-controls position={10} duration={94} />)],
  ['sc-numpad', () => render(<sc-numpad full={true} />)],
  [
    'sc-station-icon',
    () =>
      render(
        <sc-station-icon collectedPercent={40}>
          <span>7</span>
        </sc-station-icon>,
      ),
  ],
  ['sc-image-slideshow', () => render(<sc-image-slideshow images={stations[0].images.map(image => image.internalWebUrl)} />)],
  ['sc-marquee', () => render(<sc-marquee active={true}>A title that may well be too long to fit</sc-marquee>)],
  ['sc-page-loading', () => render(<sc-page-loading image="assets/loading.png" facade={facade()} />)],
  ['sc-page-language', () => render(<sc-page-language facade={facade()} />)],
  ['sc-page-pin', () => render(<sc-page-pin facade={facade()} />)],
  ['sc-page-error', () => render(<sc-page-error facade={facade()} />)],
  ['sc-page-selection', () => render(<sc-page-selection facade={facade()} />)],
  ['sc-page-station-list', () => render(<sc-page-station-list facade={facade()} />)],
  ['sc-page-station-image-list', () => render(<sc-page-station-image-list facade={facade()} />)],
  ['sc-page-tabbed-station-list', () => render(<sc-page-tabbed-station-list facade={facade()} />)],
  ['sc-page-tour-list', () => render(<sc-page-tour-list facade={facade()} />)],
  ['sc-page-station', () => render(<sc-page-station stationId="1" facade={facade()} />)],
  ['sc-page-multi-audio-station', () => render(<sc-page-multi-audio-station stationId="multi" facade={facade()} />)],
  ['sc-page-stations', () => render(<sc-page-stations stationId="default" facade={facade(new CollectibleAudioPlayerService(''))} />)],
  [
    'sc-page-map',
    () =>
      render(
        <sc-page-map mapBounds={[47.58308, 12.166456, 47.578141, 12.171476]} tileUrlTemplate="map-assets/{z}/{y}/{x}.jpeg" mapAttribution="&copy; basemap.at" facade={facade()} />,
      ),
  ],
];

describe('accessibility', () => {
  for (const [name, renderCase] of cases) {
    it(`${name} has only its known violations`, async () => {
      const root = await settled(await renderCase());
      expect(await violations(root)).toMatchSnapshot();
    });
  }
});
