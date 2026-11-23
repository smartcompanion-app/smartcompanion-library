import { beforeEach, describe, expect, test } from 'vitest';
import { MemoryStorage } from '@smartcompanion/data';
import { ServiceFacade } from '../src/service-facade';

const getData = (checksum: string, languages: string[]) => ({
  checksum,
  assets: [],
  stations: languages.map(language => ({ id: 's1', title: language, language, images: [], audios: [] })),
  tours: languages.map(language => ({ id: 't1', title: language, language, default: true, images: [], stations: ['s1'] })),
  languages: languages.map(language => ({ language, title: language })),
  texts: languages.map(language => ({ language, key: 'greeting', value: `greeting ${language}` })),
});

describe('a visitor chose a language the guide later removes', () => {
  let storage: MemoryStorage;

  // A new facade on the same storage is what a start of the app creates
  const startApp = (data: unknown) => {
    const facade = new ServiceFacade(storage);
    facade.registerOnlineLoadService(async () => data);
    return facade;
  };

  beforeEach(async () => {
    storage = new MemoryStorage();
    const facade = startApp(getData('1', ['en', 'de']));
    await facade.getLoadService().load();
    facade.changeLanguage('en');
  });

  test('the only remaining language is used, with its stations, tours and texts', async () => {
    const facade = startApp(getData('2', ['de']));
    expect(facade.getLanguageService().getCurrentLanguage()).toBe('en');

    expect(await facade.getLoadService().load()).toBe('home');
    expect(facade.getLanguageService().getCurrentLanguage()).toBe('de');
    expect(await facade.getStationService().getStations()).toMatchObject([{ language: 'de' }]);
    expect(await facade.getTourService().getTours()).toMatchObject([{ language: 'de' }]);
    expect(await facade.getTourService().getDefaultTour()).toMatchObject({ language: 'de' });
    expect(facade.__('greeting')).toBe('greeting de');
  });

  test('the visitor chooses again when several languages remain', async () => {
    const facade = startApp(getData('2', ['de', 'fr']));

    expect(await facade.getLoadService().load()).toBe('language');
    expect(facade.canLoadRoute()).toEqual({ redirect: '/' });

    facade.changeLanguage('fr');

    expect(await facade.getLoadService().load()).toBe('home');
    expect(facade.canLoadRoute()).toBe(true);
    expect(await facade.getStationService().getStations()).toMatchObject([{ language: 'fr' }]);
  });

  test('the next start uses the same language', async () => {
    await startApp(getData('2', ['de'])).getLoadService().load();

    expect(startApp(getData('2', ['de'])).getLanguageService().getCurrentLanguage()).toBe('de');
  });
});
