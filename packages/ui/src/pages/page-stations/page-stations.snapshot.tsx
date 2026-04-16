import { render, expect, test, h } from '@stencil/vitest';
import { CollectibleAudioPlayerService, ServiceFacade, MenuService } from '@smartcompanion/services';
import { Station, StationService } from '@smartcompanion/data';
import { stations as fixtureStations } from '../../../test/fixtures';

const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const stations: Station[] = fixtureStations.map(station => ({
  ...station,
  audios: station.audios.map(audio => ({ ...audio, internalFileUrl: SILENT_AUDIO, internalWebUrl: SILENT_AUDIO })),
}));

const facade = {
  getAudioPlayerService: () => new CollectibleAudioPlayerService(''),
  getStationService: () => ({
    getStations: () => Promise.resolve(stations),
  }) as Partial<StationService>,
  getMenuService: () => ({
    enable: () => Promise.resolve(),
  }) as Partial<MenuService>,
} as unknown as ServiceFacade;

test('render page stations', async () => {
  const { root } = await render(
    <sc-page-stations stationId="default" facade={facade}></sc-page-stations>
  );
  expect(root).toMatchSnapshot();
});
