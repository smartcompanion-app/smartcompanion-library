import { render, h, describe, it, expect } from '@stencil/vitest';
import { AudioPlayerService, ServiceFacade, MenuService, CollectibleAudioPlayerService } from '@smartcompanion/services';
import { StationService, Station } from '@smartcompanion/data';
import { stations as fixtureStations } from '../../../test/fixtures';

// Use silent audio data URI so loadAudio resolves without needing real files
const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const stations: Station[] = fixtureStations.map(station => ({
  ...station,
  audios: station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO })),
}));

const audioPlayerService: AudioPlayerService = new CollectibleAudioPlayerService('');

const facade = {
  getAudioPlayerService: () => audioPlayerService,
  getStationService: () => ({
    updateCollectedPercentage: (stationId: string, _: string, collectedPercentage: number) => {
      return Promise.resolve({
        ...stations.find(station => station.id === stationId),
        collectedPercentage,
      });
    },
    getStations: () => Promise.resolve(stations),
  }) as StationService,
  getMenuService: () => ({
    enable: () => Promise.resolve(),
  }) as MenuService,
} as ServiceFacade;

const getPlayerButton = (root: HTMLElement, testId: string) => {
  return root.querySelector('sc-player-controls').shadowRoot.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
};

describe('sc-page-stations', () => {
  // The native audio player appends `<audio id="web-audio">` to document.body
  // once start() has populated its items list. Wait for it before any prev/next
  // click, otherwise the player throws when accessing items[-1].
  const waitForAudioReady = () => expect.poll(() => document.querySelector('#web-audio') !== null).toBe(true);

  it('should activate last item when clicking prev from first item', async () => {
    const { root, waitForChanges } = await render(
      <sc-page-stations stationId="default" enableSwitchAudioOutput={false} facade={facade}></sc-page-stations>
    );
    await waitForChanges();
    await waitForAudioReady();
    // Confirm initial select(0) + listener wiring landed before interacting
    await expect.poll(() => {
      const firstItem = root.querySelector('[data-testid="player-list-item-0"]');
      return firstItem?.classList.contains('active');
    }).toBe(true);

    getPlayerButton(root, 'player-prev-button').click();

    await expect.poll(() => {
      const lastItem = root.querySelector('[data-testid="player-list-item-2"]');
      return lastItem?.classList.contains('active');
    }).toBe(true);
  });

  it('should activate first item when clicking next from last item', async () => {
    const { root, waitForChanges } = await render(
      <sc-page-stations stationId="default" enableSwitchAudioOutput={false} facade={facade}></sc-page-stations>
    );
    await waitForChanges();
    await waitForAudioReady();
    // Confirm initial select(0) + listener wiring landed before interacting
    await expect.poll(() => {
      const firstItem = root.querySelector('[data-testid="player-list-item-0"]');
      return firstItem?.classList.contains('active');
    }).toBe(true);

    // Navigate to last item first
    getPlayerButton(root, 'player-prev-button').click();
    await expect.poll(() => {
      const lastItem = root.querySelector('[data-testid="player-list-item-2"]');
      return lastItem?.classList.contains('active');
    }).toBe(true);

    // Then click next to wrap to first
    getPlayerButton(root, 'player-next-button').click();
    await expect.poll(() => {
      const firstItem = root.querySelector('[data-testid="player-list-item-0"]');
      return firstItem?.classList.contains('active');
    }).toBe(true);
  });
});
