import { render, expect, test, h } from '@stencil/vitest';
import { Menu, PageMultiAudioStationFacade, StationSource } from '../../contracts';
import { AudioPlayerService } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';
import { getMultiAudioStation } from '../../../test/fixtures';

const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const createStation = (): Station => {
  const station = getMultiAudioStation();
  station.audios = station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO }));
  return station;
};

const facade = {
  getAudioPlayerService: () => new AudioPlayerService(''),
  getMenuService: () =>
    ({
      enable: () => Promise.resolve(),
    }) as Partial<Menu>,
  getStationService: () =>
    ({
      getStation: () => Promise.resolve(createStation()),
    }) as Partial<StationSource>,
  __: (key: string) => {
    switch (key) {
      case 'station-list':
        return 'Station Overview';
      default:
        return key;
    }
  },
} as unknown as PageMultiAudioStationFacade;

// Swiper in image-slideshow requires real DOM (element.children iteration), skip in mock-doc
test.skip('render page multi audio station', async () => {
  const { root } = await render(<sc-page-multi-audio-station stationId="123" facade={facade}></sc-page-multi-audio-station>);
  expect(root).toMatchSnapshot();
});
