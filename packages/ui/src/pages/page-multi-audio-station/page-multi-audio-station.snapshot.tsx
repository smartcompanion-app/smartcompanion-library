import { render, expect, test, h } from '@stencil/vitest';
import { AudioPlayerService, ServiceFacade, MenuService } from '@smartcompanion/services';
import { Station, StationService } from '@smartcompanion/data';
import { getMultiAudioStation } from '../../../test/fixtures';

const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const createStation = (): Station => {
  const station = getMultiAudioStation();
  station.audios = station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO }));
  return station;
};

const facade = {
  getAudioPlayerService: () => new AudioPlayerService(''),
  getMenuService: () => ({
    enable: () => Promise.resolve(),
  }) as Partial<MenuService>,
  getStationService: () => ({
    getStation: () => Promise.resolve(createStation()),
  }) as Partial<StationService>,
  __: (key: string) => {
    switch (key) {
      case 'station-list': return 'Station Overview';
      default: return key;
    }
  },
} as unknown as ServiceFacade;

// Swiper in image-slideshow requires real DOM (element.children iteration), skip in mock-doc
test.skip('render page multi audio station', async () => {
  const { root } = await render(
    <sc-page-multi-audio-station stationId="123" facade={facade}></sc-page-multi-audio-station>
  );
  expect(root).toMatchSnapshot();
});
