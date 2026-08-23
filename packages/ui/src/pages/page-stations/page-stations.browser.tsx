import { render, h, describe, it, expect } from '@stencil/vitest';
import { Menu, PageStationFacade, StationSource } from '../../contracts';
import { AudioPlayerService, AudioPlayerUpdate, CollectibleAudioPlayerService } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';
import type { Swiper } from 'swiper';
import { stations as fixtureStations } from '../../../test/fixtures';

// Use silent audio data URI so loadAudio resolves without needing real files
const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const stations: Station[] = fixtureStations.map(station => ({
  ...station,
  audios: station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO })),
}));

// The three fixture stations fit inside the list without overflowing it, which
// leaves swiper locked -- slideTo() is a no-op by design in that state. Repeating
// them gives a list long enough to actually scroll. The audio ids have to be made
// unique along with the station ids: the player identifies items by audio id and
// getIndex() returns the first match, so repeated ids would resolve a skip to the
// wrong index and quietly weaken what this test proves.
const scrollingStations: Station[] = Array.from({ length: 12 }, (_, index) => {
  const station = stations[index % stations.length];
  return {
    ...station,
    id: `${index + 1}`,
    number: `${index + 1}`,
    audios: station.audios.map(audio => ({ ...audio, id: `${audio.id}-${index + 1}` })),
  };
});

// initAudioPlayer() is kicked off from componentDidLoad() and is still in
// flight when waitForChanges() resolves: it awaits start() and setSpeaker(),
// fires registerUpdateListener() *without* awaiting it, then awaits select(). A
// prev/next click landing before that listener is wired notifies nobody -- the
// 'skip' update is dropped, activeIndex never moves, and the polls below can
// never succeed no matter how long they wait.
//
// Neither registration completing nor select() resolving is a trustworthy gate
// on its own: initAudioPlayer() does not await the former, and
// CollectibleAudioPlayerService in turn does not await super. So gate on the
// page's own listener actually receiving an update -- the 'skip' emitted by the
// initial select() -- which proves the whole chain end to end.
let pageReceivedUpdate = false;

const audioPlayerService: AudioPlayerService = new CollectibleAudioPlayerService('');
const registerUpdateListener = audioPlayerService.registerUpdateListener.bind(audioPlayerService);
audioPlayerService.registerUpdateListener = (callback: (update: AudioPlayerUpdate) => void) =>
  registerUpdateListener((update: AudioPlayerUpdate) => {
    callback(update);
    pageReceivedUpdate = true;
  });

const createFacade = (availableStations: Station[]) =>
  ({
    getAudioPlayerService: () => audioPlayerService,
    getStationService: () =>
      ({
        updateCollectedPercentage: (stationId: string, _: string, collectedPercentage: number) => {
          return Promise.resolve({
            ...availableStations.find(station => station.id === stationId),
            collectedPercentage,
          });
        },
        getStations: () => Promise.resolve(availableStations),
      }) as StationSource,
    getMenuService: () =>
      ({
        enable: () => Promise.resolve(),
      }) as Menu,
  }) as unknown as PageStationFacade;

const facade = createFacade(stations);

const getPlayerButton = (root: HTMLElement, testId: string) => {
  return root.querySelector('sc-player-controls').shadowRoot.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
};

// Renders the page and waits until its audio player has finished initializing.
// The flag is reset per render because the service instance is shared across
// tests -- without the reset the second render would pass the gate on the first
// render's initialization.
const renderPage = async (pageFacade: PageStationFacade = facade): Promise<HTMLElement> => {
  pageReceivedUpdate = false;
  const { root, waitForChanges } = await render(<sc-page-stations stationId="default" enableSwitchAudioOutput={false} facade={pageFacade}></sc-page-stations>);
  await waitForChanges();
  await expect.poll(() => pageReceivedUpdate).toBe(true);
  return root;
};

describe('sc-page-stations', () => {
  const item = (root: HTMLElement, index: number) => root.querySelector(`[data-testid="player-list-item-${index}"]`);

  // Swiper only initializes against a real DOM, so its own state is asserted here
  // rather than in the mock-doc snapshot.
  const list = (root: HTMLElement) => root.querySelector('#player-list') as HTMLElement & { swiper?: Swiper };
  const swiperOf = (root: HTMLElement) => list(root).swiper;
  const isInitialized = (root: HTMLElement) => list(root).classList.contains('swiper-initialized');

  it('should initialize a vertical swiper over the station list', async () => {
    const root = await renderPage();

    await expect.poll(() => isInitialized(root)).toBe(true);
    expect(list(root).classList.contains('swiper-vertical')).toBe(true);
    expect(swiperOf(root).slides.length).toBe(stations.length);
    expect(item(root, 0).classList.contains('swiper-slide-active')).toBe(true);
  });

  it('should scroll the list to a station that skipping put out of view', async () => {
    const root = await renderPage(createFacade(scrollingStations));

    await expect.poll(() => isInitialized(root)).toBe(true);
    expect(swiperOf(root).slides.length).toBe(scrollingStations.length);
    // A locked swiper ignores slideTo, which would make the assertion below vacuous.
    expect(swiperOf(root).isLocked).toBe(false);
    expect(swiperOf(root).translate).toBe(0);

    // Skipping back from the first station wraps to the last one, far enough down
    // the list that swiper has to scroll it into view.
    getPlayerButton(root, 'player-prev-button').click();

    const last = scrollingStations.length - 1;
    await expect.poll(() => item(root, last).classList.contains('active')).toBe(true);
    expect(swiperOf(root).translate).toBeLessThan(0);
    expect(item(root, 0).classList.contains('swiper-slide-active')).toBe(false);
  });

  it('should activate last item when clicking prev from first item', async () => {
    const root = await renderPage();

    getPlayerButton(root, 'player-prev-button').click();

    await expect
      .poll(() => {
        const lastItem = root.querySelector('[data-testid="player-list-item-2"]');
        return lastItem?.classList.contains('active');
      })
      .toBe(true);
  });

  it('should activate first item when clicking next from last item', async () => {
    const root = await renderPage();

    // Navigate to last item first
    getPlayerButton(root, 'player-prev-button').click();
    await expect
      .poll(() => {
        const lastItem = root.querySelector('[data-testid="player-list-item-2"]');
        return lastItem?.classList.contains('active');
      })
      .toBe(true);

    // Then click next to wrap to first
    getPlayerButton(root, 'player-next-button').click();
    await expect
      .poll(() => {
        const firstItem = root.querySelector('[data-testid="player-list-item-0"]');
        return firstItem?.classList.contains('active');
      })
      .toBe(true);
  });

  // Regression test for #95. These page components declare neither `shadow` nor
  // `scoped`, so this stylesheet is injected as global CSS. While its rules were
  // written as bare element selectors, rendering this page restyled `ion-header`
  // for the whole app -- which pushed the number input on sc-page-selection
  // behind the toolbar wherever the status bar contributes a safe-area inset.
  //
  // Asserting on a header outside the page is the point: a header *inside* it is
  // meant to be absolute, and would pass either way.
  it('should not restyle ion-header outside the page', async () => {
    await renderPage();

    const outside = document.createElement('ion-header');
    document.body.appendChild(outside);

    try {
      expect(getComputedStyle(outside).position).not.toBe('absolute');
    } finally {
      outside.remove();
    }
  });

  it('should still position its own header absolutely', async () => {
    const root = await renderPage();

    const own = root.querySelector('ion-header');
    // Without this, a markup change that drops the header surfaces as a
    // getComputedStyle TypeError rather than as this test failing.
    expect(own, 'sc-page-stations should render an ion-header').not.toBeNull();
    expect(getComputedStyle(own!).position).toBe('absolute');
  });
});
