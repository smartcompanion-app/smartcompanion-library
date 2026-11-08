import { render, expect, test, h } from '@stencil/vitest';
import { Menu, PageStationFacade, StationSource, TourSource } from '../../contracts';
import { AudioPlayerService } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';
import { stations as fixtureStations } from '../../../test/fixtures';

const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const stations: Station[] = fixtureStations.map(station => ({
  ...station,
  audios: station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO })),
}));

// mock-doc's audio element has no pause(), which the player's stop() calls when a page is
// replaced by the next test's
const createAudioPlayerService = () => {
  const audioPlayerService = new AudioPlayerService('');
  audioPlayerService.stop = () => Promise.resolve();
  return audioPlayerService;
};

const facade = {
  getAudioPlayerService: createAudioPlayerService,
  getTourService: () =>
    ({
      getStations: () => Promise.resolve(stations),
    }) as Partial<TourSource>,
  getStationService: () =>
    ({
      getStations: () => Promise.resolve(stations),
    }) as Partial<StationSource>,
  getMenuService: () =>
    ({
      enable: () => Promise.resolve(),
    }) as Partial<Menu>,
} as unknown as PageStationFacade;

test('render page station', async () => {
  const { root } = await render(<sc-page-station stationId="1" facade={facade}></sc-page-station>);
  expect(root).toMatchSnapshot();
});

test('render page station for a station without images', async () => {
  const withoutImages = stations.map(station => ({ ...station, images: [] }));
  const facadeWithoutImages = {
    ...facade,
    getStationService: () => ({ getStations: () => Promise.resolve(withoutImages) }) as Partial<StationSource>,
  } as unknown as PageStationFacade;

  const { root } = await render(<sc-page-station stationId="1" facade={facadeWithoutImages}></sc-page-station>);

  expect(root.querySelector('sc-player-controls')).not.toBeNull();
});
