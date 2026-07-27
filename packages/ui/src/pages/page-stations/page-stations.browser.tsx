import { render, h, describe, it, expect } from '@stencil/vitest';
import { Menu, PageStationFacade, StationSource } from '../../contracts';
import { AudioPlayerService, CollectibleAudioPlayerService } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';
import { stations as fixtureStations } from '../../../test/fixtures';

// Use silent audio data URI so loadAudio resolves without needing real files
const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const stations: Station[] = fixtureStations.map(station => ({
  ...station,
  audios: station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO })),
}));

// initAudioPlayer() is kicked off from componentDidLoad() and is still in
// flight when waitForChanges() resolves -- it awaits start(), setSpeaker() and
// registerUpdateListener() before its closing select(). A prev/next click that
// lands before that listener is wired notifies nobody: the 'skip' update is
// dropped, activeIndex never moves, and the polls below can never succeed no
// matter how long they wait. select() resolving is the last step of the chain,
// so it is the signal that the page is safe to click.
let audioPlayerReady = false;

const audioPlayerService: AudioPlayerService = new CollectibleAudioPlayerService('');
const selectAudio = audioPlayerService.select.bind(audioPlayerService);
audioPlayerService.select = async (index: number) => {
  await selectAudio(index);
  audioPlayerReady = true;
};

const facade = {
  getAudioPlayerService: () => audioPlayerService,
  getStationService: () =>
    ({
      updateCollectedPercentage: (stationId: string, _: string, collectedPercentage: number) => {
        return Promise.resolve({
          ...stations.find(station => station.id === stationId),
          collectedPercentage,
        });
      },
      getStations: () => Promise.resolve(stations),
    }) as StationSource,
  getMenuService: () =>
    ({
      enable: () => Promise.resolve(),
    }) as Menu,
} as unknown as PageStationFacade;

const getPlayerButton = (root: HTMLElement, testId: string) => {
  return root.querySelector('sc-player-controls').shadowRoot.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
};

// Renders the page and waits until its audio player has finished initializing.
// The flag is reset per render because the service instance is shared across
// tests -- without the reset the second render would pass the gate on the first
// render's initialization.
const renderPage = async (): Promise<HTMLElement> => {
  audioPlayerReady = false;
  const { root, waitForChanges } = await render(<sc-page-stations stationId="default" enableSwitchAudioOutput={false} facade={facade}></sc-page-stations>);
  await waitForChanges();
  await expect.poll(() => audioPlayerReady).toBe(true);
  return root;
};

describe('sc-page-stations', () => {
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
});
