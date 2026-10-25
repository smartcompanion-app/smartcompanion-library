import { test, expect, vi, beforeEach } from 'vitest';
import { Station } from '@smartcompanion/data';
import { AudioPlayerFacade, AudioPlayerUpdate } from '../contracts';
import { audioPlayerComponent, readEarpiece } from './audio-player-component';

// The Stencil compiler removes the decorators; at runtime @stencil/core has none
vi.mock('@stencil/core', () => ({ State: () => () => {} }));

const store: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    Object.keys(store).forEach(k => delete store[k]);
  },
  get length() {
    return Object.keys(store).length;
  },
  key: (index: number) => Object.keys(store)[index] ?? null,
};

const AudioPlayerPage = audioPlayerComponent(class {});

function createMocks() {
  const mockAudioPlayerService = {
    pause: vi.fn().mockResolvedValue(undefined),
    play: vi.fn().mockResolvedValue(undefined),
    seek: vi.fn().mockResolvedValue(undefined),
    setSpeaker: vi.fn().mockResolvedValue(undefined),
    setEarpiece: vi.fn().mockResolvedValue(undefined),
  };

  const facade = {
    getAudioPlayerService: () => mockAudioPlayerService,
  } as unknown as AudioPlayerFacade;

  const createPage = () => Object.assign(new AudioPlayerPage(), { facade });

  return { facade, mockAudioPlayerService, createPage };
}

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
});

test('updateAudioIndex makes the audio index the active index by default', () => {
  const { createPage } = createMocks();
  const page = createPage();

  page.updateAudioIndex(2);

  expect(page.audioIndex).toBe(2);
  expect(page.activeIndex).toBe(2);
});

test('updateAudioIndex leaves the active index to a page overriding onAudioIndexChange', () => {
  const StationPage = class extends AudioPlayerPage {
    onAudioIndexChange(audioIndex: number) {
      this.activeIndex = audioIndex * 10;
    }
  };
  const page = new StationPage();

  page.updateAudioIndex(2);

  expect(page.audioIndex).toBe(2);
  expect(page.activeIndex).toBe(20);
});

test('playPause calls play when not playing', async () => {
  const { createPage, mockAudioPlayerService } = createMocks();
  const page = createPage();

  await page.playPause();

  expect(mockAudioPlayerService.play).toHaveBeenCalled();
  expect(mockAudioPlayerService.pause).not.toHaveBeenCalled();
});

test('playPause calls pause when playing', async () => {
  const { createPage, mockAudioPlayerService } = createMocks();
  const page = createPage();
  page.playing = true;

  await page.playPause();

  expect(mockAudioPlayerService.pause).toHaveBeenCalled();
  expect(mockAudioPlayerService.play).not.toHaveBeenCalled();
});

test('toggleOutput switches from speaker to earpiece', async () => {
  const { createPage, mockAudioPlayerService } = createMocks();
  const page = createPage();

  await page.toggleOutput();

  expect(mockAudioPlayerService.setEarpiece).toHaveBeenCalled();
  expect(page.earpiece).toBe(true);
  expect(store['audio-earpiece']).toBe('yes');
});

test('toggleOutput switches from earpiece to speaker', async () => {
  const { createPage, mockAudioPlayerService } = createMocks();
  const page = createPage();
  page.earpiece = true;

  await page.toggleOutput();

  expect(mockAudioPlayerService.setSpeaker).toHaveBeenCalled();
  expect(page.earpiece).toBe(false);
  expect(store['audio-earpiece']).toBe('no');
});

test('readEarpiece returns true when localStorage has yes', () => {
  store['audio-earpiece'] = 'yes';

  expect(readEarpiece()).toBe(true);
});

test('readEarpiece returns false when localStorage has no value', () => {
  expect(readEarpiece()).toBe(false);
});

test('readEarpiece returns false when localStorage has other value', () => {
  store['audio-earpiece'] = 'no';

  expect(readEarpiece()).toBe(false);
});

test('a page initializes earpiece from localStorage', () => {
  store['audio-earpiece'] = 'yes';
  const { createPage } = createMocks();

  expect(createPage().earpiece).toBe(true);
});

test('onCompleted rewinds the audio by default', async () => {
  const { createPage, mockAudioPlayerService } = createMocks();
  const page = createPage();
  page.position = 42;

  await page.onCompleted({ state: 'completed', index: 0, id: '1-audio' });

  expect(mockAudioPlayerService.pause).toHaveBeenCalled();
  expect(mockAudioPlayerService.seek).toHaveBeenCalledWith(0);
  expect(page.position).toBe(0);
});

// A page left right after opening it is destroyed while initAudioPlayer() still
// awaits start(). The page's stop() clears the player's items, so the select()
// that init went on to make rejected with "Item with id ... doesn't exist".
const stations = [{ id: '1', audios: ['1-audio'] }] as unknown as Station[];

function createPlayerMocks() {
  const { createPage, mockAudioPlayerService } = createMocks();
  let started: () => void = () => {};
  const service = Object.assign(mockAudioPlayerService, {
    start: vi.fn(() => new Promise<void>(resolve => (started = resolve))),
    stop: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockResolvedValue(undefined),
    registerUpdateListener: vi.fn(),
    unregisterUpdateListener: vi.fn(),
    getDuration: vi.fn().mockResolvedValue(0),
  });
  return { createPage, service, started: () => started() };
}

test('initAudioPlayer stops instead of selecting when the page is destroyed while starting', async () => {
  const { createPage, service, started } = createPlayerMocks();
  const page = createPage();

  const init = page.initAudioPlayer(stations);
  await page.destroyAudioPlayer();
  started();
  await init;

  expect(service.select).not.toHaveBeenCalled();
  expect(service.registerUpdateListener).not.toHaveBeenCalled();
  // once by destroy, once more after the late start
  expect(service.stop).toHaveBeenCalledTimes(2);
});

test('initAudioPlayer selects the active audio when the page stays', async () => {
  const { createPage, service, started } = createPlayerMocks();
  const page = createPage();

  const init = page.initAudioPlayer(stations);
  started();
  await init;

  expect(service.registerUpdateListener).toHaveBeenCalledTimes(1);
  expect(service.select).toHaveBeenCalledWith(0);
  expect(service.stop).not.toHaveBeenCalled();
});

test('initAudioPlayer starts without selecting when no audio is active', async () => {
  const { createPage, service, started } = createPlayerMocks();
  const page = createPage();
  page.audioIndex = -1;

  const init = page.initAudioPlayer(stations);
  started();
  await init;

  expect(service.start).toHaveBeenCalledTimes(1);
  expect(service.registerUpdateListener).toHaveBeenCalledTimes(1);
  expect(service.select).not.toHaveBeenCalled();
});

// The player cannot start on an empty playlist: the web player loads its first item
test('initAudioPlayer does not start the player when no station has audio', async () => {
  const { createPage, service } = createPlayerMocks();
  const page = createPage();

  await page.initAudioPlayer([{ id: '1', audios: [] }, { id: '2' }] as unknown as Station[]);

  expect(service.start).not.toHaveBeenCalled();
  expect(service.registerUpdateListener).not.toHaveBeenCalled();
  expect(service.select).not.toHaveBeenCalled();
});

// With ion-router-outlet the next page starts the shared player before the
// page it replaces is removed. The removed page's stop() then stopped the new
// page's player, whose select() failed in turn.
test('destroyAudioPlayer leaves the player to a page that started after it', async () => {
  const { createPage, mockAudioPlayerService } = createMocks();
  const starts: Array<() => void> = [];
  const service = Object.assign(mockAudioPlayerService, {
    start: vi.fn(() => new Promise<void>(resolve => starts.push(resolve))),
    stop: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockResolvedValue(undefined),
    registerUpdateListener: vi.fn(),
    unregisterUpdateListener: vi.fn(),
    getDuration: vi.fn().mockResolvedValue(0),
  });
  const leaving = createPage();
  const entering = createPage();

  const leavingInit = leaving.initAudioPlayer(stations);
  const enteringInit = entering.initAudioPlayer(stations);
  await leaving.destroyAudioPlayer();
  starts.forEach(started => started());
  await Promise.all([leavingInit, enteringInit]);

  expect(service.stop).not.toHaveBeenCalled();
  expect(service.unregisterUpdateListener).not.toHaveBeenCalled();
  expect(service.registerUpdateListener).toHaveBeenCalledTimes(1);
  expect(service.select).toHaveBeenCalledTimes(1);

  // and the entering page, now the one playing, stops it when it is left
  await entering.destroyAudioPlayer();
  expect(service.stop).toHaveBeenCalledTimes(1);
  expect(service.unregisterUpdateListener).toHaveBeenCalledTimes(1);
});

test('initAudioPlayer does not reject when stopping a player left half-started fails', async () => {
  const { createPage, service, started } = createPlayerMocks();
  service.stop.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new TypeError("Cannot read properties of undefined (reading 'id')"));
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const page = createPage();

  const init = page.initAudioPlayer(stations);
  await page.destroyAudioPlayer();
  started();

  await expect(init).resolves.toBeUndefined();
  expect(warn).toHaveBeenCalledTimes(1);
  warn.mockRestore();
});

// An update the player sends while the page is being left must not reach it
test('a destroyed page ignores updates from the player', async () => {
  const { createPage, service, started } = createPlayerMocks();
  const page = createPage();
  const onSkip = vi.spyOn(page, 'onSkip');

  const init = page.initAudioPlayer(stations);
  started();
  await init;
  const listener: (update: AudioPlayerUpdate) => Promise<void> = service.registerUpdateListener.mock.calls[0][0];
  await page.destroyAudioPlayer();
  await listener({ state: 'skip', index: 1, id: '2-audio' });
  await listener({ state: 'playing', index: 1, id: '2-audio' });

  expect(onSkip).not.toHaveBeenCalled();
  expect(page.audioIndex).toBe(0);
  expect(page.playing).toBe(false);
});
