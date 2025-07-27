import { faker } from '@faker-js/faker';
import { Station, Asset, Tour } from '../../src';
import { Storage } from '../../src/storage';

export function getPin(): string {
  return faker.number.int({ min: 1000, max: 9999 }).toString();
}

export function getTour(language?: string, default_: boolean = false): Tour {
  return {
    id: faker.string.alphanumeric(10),
    title: faker.lorem.sentence(),
    default: default_,
    language: language || getRandomLocale(),
    images: [faker.string.sample()],
    stations: [faker.string.alphanumeric(10), faker.string.alphanumeric(10), faker.string.alphanumeric(10)]
  };
}

export function getStation(language?: string, setCollectedPercentage: boolean = false): Station {
  return {
    id: faker.string.alphanumeric(10),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(5),
    language: language || getRandomLocale(),
    subtitle: faker.lorem.sentence(),
    number: faker.number.int() + '',
    images: [faker.string.sample(), faker.string.sample()],
    audios: [faker.string.sample(), faker.string.sample()],
    collectedPercentage: setCollectedPercentage ? faker.number.float({ min: 0, max: 1 }) : undefined
  };
}

export function getAsset(language?: string): Asset {
  language = !language ? undefined : (
    language ||
    getRandomLocale()
  );

  return {
    id: faker.string.alphanumeric(10),
    filename: faker.system.fileName(),
    externalUrl: faker.internet.url(),
    internalFileUrl: faker.internet.url(),
    internalWebUrl: faker.internet.url(),
    language: language,
  };
}

export function getRandomLocale(): string {
  return faker.helpers.arrayElement(['de', 'it', 'at', 'en', 'es', 'cz']);
}

export function clone(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

export function setAssetWithoutLanguageToStorage(storage: Storage): Asset {
  const asset = getAsset();
  asset.language = undefined;
  storage.set(`asset-${asset.id}`, asset);
  appendAssetInStorage(asset, storage);
  return clone(asset);
}

export function setAssetToStorage(storage: Storage, language?: string): Asset {
  const asset = getAsset(language);
  storage.set(`asset-${asset.id}`, asset);
  appendAssetInStorage(asset, storage);
  return clone(asset);
}

export function setTourToStorage(storage: Storage, language?: string, default_: boolean = false): Tour {
  const tour = getTour(language, default_);
  tour.images = [] as string[];
  tour.stations = [] as string[];

  for (let i = 0; i < 2; i++) {
    let asset = setAssetToStorage(storage, tour.language);
    tour.images.push(asset.id);
  }
  for (let i = 0; i < 5; i++) {
    let station = setStationToStorage(storage, tour.language);
    tour.stations.push(station.id);
  }

  storage.set(`tour-${tour.language}-${tour.id}`, tour);
  appendTourInStorage(tour, storage);

  if (tour.default) {
    storage.set(`tour-${tour.language}-default-id`, tour.id);
  }

  return clone(tour);
}

export function setStationToStorage(
  storage: Storage,
  language?: string,
  assetCount: number = 2,
  setCollectedPercentage: boolean = false
): Station {
  const station = getStation(language, setCollectedPercentage);
  station.images = [] as string[];
  station.audios = [] as string[];

  for (let i = 0; i < assetCount; i++) {
    let asset = setAssetToStorage(storage, station.language);
    station.images.push(asset.id);
  }
  for (let i = 0; i < assetCount; i++) {
    let asset = setAssetToStorage(storage, station.language);
    station.audios.push(asset.id);
  }

  storage.set(`station-${station.language}-${station.id}`, station);
  appendStationInStorage(station, storage);

  return clone(station);
}

function appendAssetInStorage(asset: Asset, storage: Storage) {
  let assets: Asset[] = storage.get('assets') || [];
  assets.push(asset);
  storage.set('assets', assets);
}

function appendStationInStorage(station: Station, storage: Storage) {
  let stations: Station[] = storage.get(`stations-${station.language}`) || [];
  stations.push(station);
  storage.set(`stations-${station.language}`, stations);
}

function appendTourInStorage(tour: Tour, storage: Storage) {
  let tours: Tour[] = storage.get(`tours-${tour.language}`) || [];
  tours.push(tour);
  storage.set(`tours-${tour.language}`, tours);
}
