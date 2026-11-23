import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { BrowserStorage, DataUpdater } from '../src';
import { namespaceHash } from '../src/storage/namespace-hash';

const ANIMALS = 'https://smartcompanion-app.github.io/data-format/animals/data.json';
const LEON = 'https://smartcompanion-app.github.io/audioguide-app/leon/data/data.json';

class FakeLocalStorage {
  protected items = new Map<string, string>();

  get length() {
    return this.items.size;
  }

  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }

  getItem(key: string) {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.items.set(key, value);
  }

  removeItem(key: string) {
    this.items.delete(key);
  }

  clear() {
    this.items.clear();
  }
}

let localStorage: FakeLocalStorage;

const keys = () => Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i));

beforeEach(() => {
  localStorage = new FakeLocalStorage();
  vi.stubGlobal('localStorage', localStorage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Stored keys depend on these values: if this test fails, apps lose their stored data
test.each([
  ['', '811c9dc5'],
  ['a', 'e40c292c'],
  ['foobar', 'bf9cf968'],
  [ANIMALS, '2be0142a'],
  [LEON, 'f2a5b9d6'],
])('hash of "%s" is %s', (namespace, expected) => {
  expect(namespaceHash(namespace)).toBe(expected);
});

test('hash is padded to 8 digits', () => {
  // a namespace whose hash has a leading zero
  const namespace = Array.from({ length: 1000 }, (_, i) => `${i}`).find(n => namespaceHash(n).startsWith('0'));

  expect(namespace).toBeDefined();
  expect(namespaceHash(namespace as string)).toMatch(/^0[0-9a-f]{7}$/);
});

describe('with a namespace', () => {
  test('keys are prefixed', () => {
    new BrowserStorage({ namespace: ANIMALS }).set('checksum', '1');

    expect(keys()).toEqual(['sc-2be0142a:checksum']);
  });

  test('values are read, checked and removed under the prefix', () => {
    const storage = new BrowserStorage({ namespace: ANIMALS });
    storage.set('language', 'de');
    storage.set('pins', ['1234']);

    expect(storage.get('language')).toBe('de');
    expect(storage.get('pins')).toEqual(['1234']);
    expect(storage.has('language')).toBe(true);

    storage.unset('language');

    expect(storage.has('language')).toBe(false);
    expect(() => storage.get('language')).toThrow('reading language was a null value');
  });

  test('another instance with the same namespace reads the same data', () => {
    new BrowserStorage({ namespace: ANIMALS }).set('language', 'de');

    expect(new BrowserStorage({ namespace: ANIMALS }).get('language')).toBe('de');
  });

  test('other namespaces and unprefixed keys are not visible', () => {
    new BrowserStorage().set('language', 'en');
    new BrowserStorage({ namespace: LEON }).set('language', 'fr');

    expect(new BrowserStorage({ namespace: ANIMALS }).has('language')).toBe(false);
  });

  test('unsetAll removes only the keys of the namespace', () => {
    const animals = new BrowserStorage({ namespace: ANIMALS });
    const leon = new BrowserStorage({ namespace: LEON });
    animals.set('language', 'en');
    leon.set('language', 'de');
    animals.set('checksum', '1');
    animals.set('pins', []);
    localStorage.setItem('audio-earpiece', 'yes');

    animals.unsetAll();

    expect(keys()).toEqual(['sc-f2a5b9d6:language', 'audio-earpiece']);
  });

  test('two apps with the same checksum keep their own stations', async () => {
    const getData = (id: string) => ({
      checksum: '1',
      assets: [],
      stations: [{ id, title: id, language: 'en', images: [], audios: [] }],
      languages: [{ language: 'en', title: 'English' }],
      texts: [],
    });
    const animals = new BrowserStorage({ namespace: ANIMALS });
    const leon = new BrowserStorage({ namespace: LEON });

    await new DataUpdater(animals).update(getData('bear'));
    await new DataUpdater(leon).update(getData('lion'));

    expect(animals.get('stations-en')).toMatchObject([{ id: 'bear' }]);
    expect(animals.has('station-en-bear')).toBe(true);
    expect(leon.get('stations-en')).toMatchObject([{ id: 'lion' }]);
  });
});

describe.each([undefined, {}, { namespace: undefined }, { namespace: '' }])('without a namespace (%o)', options => {
  test('keys are not prefixed', () => {
    new BrowserStorage(options).set('checksum', '1');

    expect(keys()).toEqual(['checksum']);
  });

  test('unsetAll clears everything', () => {
    const storage = new BrowserStorage(options);
    storage.set('checksum', '1');
    localStorage.setItem('audio-earpiece', 'yes');

    storage.unsetAll();

    expect(keys()).toEqual([]);
  });
});
