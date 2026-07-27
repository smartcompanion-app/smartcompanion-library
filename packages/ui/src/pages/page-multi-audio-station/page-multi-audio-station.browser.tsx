import { render, h, describe, it, expect } from '@stencil/vitest';
import { Menu, PageMultiAudioStationFacade, StationSource } from '../../contracts';
import { AudioPlayerService, AudioPlayerUpdate } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';
import { getMultiAudioStation } from '../../../test/fixtures';

// Use silent audio data URI so loadAudio resolves without needing real files
const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const createStation = (): Station => {
  const station = getMultiAudioStation();
  station.audios = station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO }));
  return station;
};

// initAudioPlayer() is kicked off from componentDidLoad() and is still in
// flight when waitForChanges() resolves: it awaits start() and setSpeaker(),
// fires registerUpdateListener() *without* awaiting it, then awaits select(). A
// prev/next click landing before that listener is wired notifies nobody -- the
// 'skip' update is dropped, activeIndex never moves, and the polls below can
// never succeed no matter how long they wait. That is how this suite failed on
// a cold CI runner while passing locally.
//
// Neither registration completing nor select() resolving is a trustworthy gate
// on its own, since initAudioPlayer() does not await the former. So gate on the
// page's own listener actually receiving an update -- the 'skip' emitted by the
// initial select() -- which proves the whole chain end to end.
let pageReceivedUpdate = false;

const audioPlayerService: AudioPlayerService = new AudioPlayerService('');
const registerUpdateListener = audioPlayerService.registerUpdateListener.bind(audioPlayerService);
audioPlayerService.registerUpdateListener = (callback: (update: AudioPlayerUpdate) => void) =>
  registerUpdateListener((update: AudioPlayerUpdate) => {
    callback(update);
    pageReceivedUpdate = true;
  });

const facade = {
  getAudioPlayerService: () => audioPlayerService,
  getMenuService: () =>
    ({
      enable: () => Promise.resolve(),
    }) as Menu,
  getStationService: () =>
    ({
      getStation: (_: string) => Promise.resolve(createStation()),
    }) as StationSource,
  __: (key: string) => {
    switch (key) {
      case 'station-list':
        return 'Station Overview';
      default:
        return key;
    }
  },
} as PageMultiAudioStationFacade;

const getPlayerButton = (root: HTMLElement, testId: string) => {
  return root.querySelector('sc-player-controls').shadowRoot.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
};

// Renders the page and waits until its audio player has finished initializing.
// The flag is reset per render because the service instance is shared across
// tests -- without the reset the second render would pass the gate on the first
// render's initialization.
const renderPage = async (): Promise<HTMLElement> => {
  pageReceivedUpdate = false;
  const { root, waitForChanges } = await render(<sc-page-multi-audio-station enableSwitchAudioOutput={true} stationId="123" facade={facade}></sc-page-multi-audio-station>);
  await waitForChanges();
  await expect.poll(() => pageReceivedUpdate).toBe(true);
  return root;
};

describe('sc-page-multi-audio-station', () => {
  it('should activate last audio item when clicking prev from first item', async () => {
    const root = await renderPage();

    getPlayerButton(root, 'player-prev-button').click();

    await expect
      .poll(() => {
        const lastItem = root.querySelector('[data-testid="audio-item-2"]');
        return lastItem?.classList.contains('active');
      })
      .toBe(true);
  });

  it('should activate first audio item when clicking next from last item', async () => {
    const root = await renderPage();

    // Navigate to last item first
    getPlayerButton(root, 'player-prev-button').click();
    await expect
      .poll(() => {
        const lastItem = root.querySelector('[data-testid="audio-item-2"]');
        return lastItem?.classList.contains('active');
      })
      .toBe(true);

    // Then click next to wrap to first
    getPlayerButton(root, 'player-next-button').click();
    await expect
      .poll(() => {
        const firstItem = root.querySelector('[data-testid="audio-item-0"]');
        return firstItem?.classList.contains('active');
      })
      .toBe(true);
  });
});
