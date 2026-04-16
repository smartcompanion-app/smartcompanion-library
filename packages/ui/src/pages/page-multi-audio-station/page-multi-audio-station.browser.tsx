import { render, h, describe, it, expect } from '@stencil/vitest';
import { MenuService, ServiceFacade, AudioPlayerService } from '@smartcompanion/services';
import { StationService, Station } from '@smartcompanion/data';
import { getMultiAudioStation } from '../../../test/fixtures';

// Use silent audio data URI so loadAudio resolves without needing real files
const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const createStation = (): Station => {
  const station = getMultiAudioStation();
  station.audios = station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO }));
  return station;
};

const audioPlayerService: AudioPlayerService = new AudioPlayerService('');

const facade = {
  getAudioPlayerService: () => audioPlayerService,
  getMenuService: () => ({
    enable: () => Promise.resolve(),
  }) as MenuService,
  getStationService: () => ({
    getStation: (_: string) => Promise.resolve(createStation()),
  }) as StationService,
  __: (key: string) => {
    switch (key) {
      case 'station-list':
        return 'Station Overview';
      default:
        return key;
    }
  },
} as ServiceFacade;

const getPlayerButton = (root: HTMLElement, testId: string) => {
  return root.querySelector('sc-player-controls').shadowRoot.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
};

describe('sc-page-multi-audio-station', () => {
  it('should activate last audio item when clicking prev from first item', async () => {
    const { root, waitForChanges } = await render(
      <sc-page-multi-audio-station enableSwitchAudioOutput={true} stationId="123" facade={facade}></sc-page-multi-audio-station>
    );
    await waitForChanges();

    getPlayerButton(root, 'player-prev-button').click();

    await expect.poll(() => {
      const lastItem = root.querySelector('[data-testid="audio-item-2"]');
      return lastItem?.classList.contains('active');
    }).toBe(true);
  });

  it('should activate first audio item when clicking next from last item', async () => {
    const { root, waitForChanges } = await render(
      <sc-page-multi-audio-station enableSwitchAudioOutput={true} stationId="123" facade={facade}></sc-page-multi-audio-station>
    );
    await waitForChanges();

    // Navigate to last item first
    getPlayerButton(root, 'player-prev-button').click();
    await expect.poll(() => {
      const lastItem = root.querySelector('[data-testid="audio-item-2"]');
      return lastItem?.classList.contains('active');
    }).toBe(true);

    // Then click next to wrap to first
    getPlayerButton(root, 'player-next-button').click();
    await expect.poll(() => {
      const firstItem = root.querySelector('[data-testid="audio-item-0"]');
      return firstItem?.classList.contains('active');
    }).toBe(true);
  });
});
