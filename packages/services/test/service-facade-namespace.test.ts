import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { BrowserStorage } from '@smartcompanion/data';
import { ServiceFacade } from '../src/service-facade';

const ANIMALS = 'https://example.org/animals/data/data.json';
const LEON = 'https://example.org/leon/data/data.json';

const getStation = (id: string, language: string) => ({ id, title: id, language, images: [], audios: ['a1'] });
const getData = (stations: unknown[], languages: string[], pins: string[] = []) => ({
  checksum: '1',
  assets: [{ id: 'a1', filename: 'a1.mp3', externalUrl: 'https://example.org/a1.mp3' }],
  stations,
  languages: languages.map(language => ({ language, title: language })),
  texts: [],
  pins,
});

const animalsData = getData([getStation('bear', 'en'), getStation('bear', 'de')], ['en', 'de'], ['1234']);
const leonData = getData([getStation('lion', 'de')], ['de']);

// A new facade is what a start of the app creates
const startApp = (namespace: string | undefined, data: unknown) => {
  const facade = new ServiceFacade(new BrowserStorage({ namespace }));
  facade.registerOnlineLoadService(async () => data);
  return facade;
};

beforeEach(() => {
  const items = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => items.set(key, value),
    removeItem: (key: string) => items.delete(key),
  });
  vi.stubGlobal('location', { hash: '#/stations/bear', search: '' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('two apps on one origin', () => {
  const openAnimalsInEnglish = async (namespace: string | undefined) => {
    const animals = startApp(namespace, animalsData);
    await animals.getLoadService().load();
    animals.changeLanguage('en');
    return animals;
  };

  test('without a namespace the second app takes over the language of the first', async () => {
    await openAnimalsInEnglish(undefined);

    expect(startApp(undefined, leonData).getLanguageService().getCurrentLanguage()).toBe('en');
  });

  test('with a namespace the second app has its own language and stations', async () => {
    await openAnimalsInEnglish(ANIMALS);
    const leon = startApp(LEON, leonData);

    expect(await leon.getLoadService().load()).toBe('home');
    expect(leon.getLanguageService().getCurrentLanguage()).toBe('de');
    expect((await leon.getStationService().getStations()).map(station => station.id)).toEqual(['lion']);
  });

  test('the first app keeps its language, stations and progress', async () => {
    const animals = await openAnimalsInEnglish(ANIMALS);
    await animals.getStationService().updateCollectedPercentage('bear', 'a1', 50);
    await startApp(LEON, leonData).getLoadService().load();

    const restarted = startApp(ANIMALS, animalsData);
    await restarted.getLoadService().load();

    expect(restarted.getLanguageService().getCurrentLanguage()).toBe('en');
    expect(await restarted.getStationService().getStations()).toMatchObject([{ id: 'bear', collectedPercentage: 50 }]);
  });

  test('both apps can be open at the same time', async () => {
    const animals = await openAnimalsInEnglish(ANIMALS);
    const leon = startApp(LEON, leonData);
    await leon.getLoadService().load();

    expect((await animals.getStationService().getStations()).map(station => station.id)).toEqual(['bear']);
    expect((await leon.getStationService().getStations()).map(station => station.id)).toEqual(['lion']);
  });

  test('a PIN asked for and entered in one app does not count in the other', async () => {
    const animals = await openAnimalsInEnglish(ANIMALS);
    expect(animals.getPinService().validatePin('1234')).toBe(true);
    const leon = startApp(LEON, leonData);
    await leon.getLoadService().load();

    expect(animals.getPinService().isValid()).toBe(true);
    expect(leon.getPinService().isValid()).toBe(false);
    expect(leon.getPinService().isPinValidationRequired()).toBe(false);
  });

  test('a page opened directly loads the own data first', async () => {
    const animals = await openAnimalsInEnglish(ANIMALS);
    animals.getPinService().validatePin('1234');
    const leon = startApp(LEON, leonData);

    expect(animals.canLoadRoute()).toBe(true);
    expect(leon.canLoadRoute()).toEqual({ redirect: '/' });
    expect(animals.getPendingRoute()).toBeNull();
    expect(leon.getPendingRoute()).toBe('/stations/bear');
  });
});
