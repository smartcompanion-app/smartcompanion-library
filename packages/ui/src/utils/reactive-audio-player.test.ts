import { test, expect, vi, beforeEach } from 'vitest';
import { AudioPlayerFacade } from '../contracts';
import { ReactiveAudioPlayer } from './reactive-audio-player';

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

  const page = {
    facade,
    earpiece: false,
    playing: false,
    position: 0,
    duration: 0,
    activeIndex: 0,
  };

  return { facade, mockAudioPlayerService, page };
}

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
});

test('updatePlaying calls registered listener', () => {
  const { page } = createMocks();
  const player = new ReactiveAudioPlayer(page);
  const listener = vi.fn();
  player.setOnPlayingUpdateListener(listener);

  player.updatePlaying(true);

  expect(listener).toHaveBeenCalledWith(true);
});

test('updatePosition calls registered listener', () => {
  const { page } = createMocks();
  const player = new ReactiveAudioPlayer(page);
  const listener = vi.fn();
  player.setOnPositionUpdateListener(listener);

  player.updatePosition(42);

  expect(listener).toHaveBeenCalledWith(42);
});

test('updateDuration calls registered listener', () => {
  const { page } = createMocks();
  const player = new ReactiveAudioPlayer(page);
  const listener = vi.fn();
  player.setOnDurationUpdateListener(listener);

  player.updateDuration(180);

  expect(listener).toHaveBeenCalledWith(180);
});

test('updateActiveIndex calls registered listener', () => {
  const { page } = createMocks();
  const player = new ReactiveAudioPlayer(page);
  const listener = vi.fn();
  player.setOnActiveIndexUpdateListener(listener);

  player.updateActiveIndex(2);

  expect(listener).toHaveBeenCalledWith(2);
});

test('updateEarpiece calls registered listener', () => {
  const { page } = createMocks();
  const player = new ReactiveAudioPlayer(page);
  const listener = vi.fn();
  player.setOnEarpieceUpdateListener(listener);

  player.updateEarpiece(true);

  expect(listener).toHaveBeenCalledWith(true);
});

test('removeAllListeners prevents future listener calls', () => {
  const { page } = createMocks();
  const player = new ReactiveAudioPlayer(page);
  const listener = vi.fn();
  player.setOnPlayingUpdateListener(listener);

  player.removeAllListeners();
  player.updatePlaying(true);

  expect(listener).not.toHaveBeenCalled();
});

test('setDefaultUpdateListeners syncs state back to page object', () => {
  const { page } = createMocks();
  const player = new ReactiveAudioPlayer(page);

  player.updatePlaying(true);
  player.updatePosition(10);
  player.updateDuration(120);
  player.updateActiveIndex(3);
  player.updateEarpiece(true);

  expect(page.playing).toBe(true);
  expect(page.position).toBe(10);
  expect(page.duration).toBe(120);
  expect(page.activeIndex).toBe(3);
  expect(page.earpiece).toBe(true);
});

test('playPause calls play when not playing', async () => {
  const { page, mockAudioPlayerService } = createMocks();
  const player = new ReactiveAudioPlayer(page);

  await player.playPause();

  expect(mockAudioPlayerService.play).toHaveBeenCalled();
  expect(mockAudioPlayerService.pause).not.toHaveBeenCalled();
});

test('playPause calls pause when playing', async () => {
  const { page, mockAudioPlayerService } = createMocks();
  page.playing = true;
  const player = new ReactiveAudioPlayer(page);
  player.updatePlaying(true);

  await player.playPause();

  expect(mockAudioPlayerService.pause).toHaveBeenCalled();
  expect(mockAudioPlayerService.play).not.toHaveBeenCalled();
});

test('toggleOutput switches from speaker to earpiece', async () => {
  const { page, mockAudioPlayerService } = createMocks();
  const player = new ReactiveAudioPlayer(page);

  await player.toggleOutput();

  expect(mockAudioPlayerService.setEarpiece).toHaveBeenCalled();
  expect(page.earpiece).toBe(true);
  expect(store['audio-earpiece']).toBe('yes');
});

test('toggleOutput switches from earpiece to speaker', async () => {
  const { page, mockAudioPlayerService } = createMocks();
  page.earpiece = true;
  const player = new ReactiveAudioPlayer(page);
  player.updateEarpiece(true);

  await player.toggleOutput();

  expect(mockAudioPlayerService.setSpeaker).toHaveBeenCalled();
  expect(page.earpiece).toBe(false);
  expect(store['audio-earpiece']).toBe('no');
});

test('readEarpiece returns true when localStorage has yes', () => {
  store['audio-earpiece'] = 'yes';
  const { page } = createMocks();
  const player = new ReactiveAudioPlayer(page);

  expect(player.readEarpiece()).toBe(true);
});

test('readEarpiece returns false when localStorage has no value', () => {
  const { page } = createMocks();
  const player = new ReactiveAudioPlayer(page);

  expect(player.readEarpiece()).toBe(false);
});

test('readEarpiece returns false when localStorage has other value', () => {
  store['audio-earpiece'] = 'no';
  const { page } = createMocks();
  const player = new ReactiveAudioPlayer(page);

  expect(player.readEarpiece()).toBe(false);
});

test('constructor initializes earpiece from localStorage', () => {
  store['audio-earpiece'] = 'yes';
  const { page } = createMocks();
  new ReactiveAudioPlayer(page);

  expect(page.earpiece).toBe(true);
});

// A page left right after opening it is destroyed while initAudioPlayer() still
// awaits start(). The page's stop() clears the player's items, so the select()
// that init went on to make rejected with "Item with id ... doesn't exist".
function createPlayerMocks() {
  const { page, mockAudioPlayerService } = createMocks();
  let started: () => void = () => {};
  const service = Object.assign(mockAudioPlayerService, {
    start: vi.fn(() => new Promise<void>(resolve => (started = resolve))),
    stop: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockResolvedValue(undefined),
    registerUpdateListener: vi.fn(),
    unregisterUpdateListener: vi.fn(),
    getDuration: vi.fn().mockResolvedValue(0),
  });
  return { page, service, started: () => started() };
}

test('initAudioPlayer stops instead of selecting when the page is destroyed while starting', async () => {
  const { page, service, started } = createPlayerMocks();
  const player = new ReactiveAudioPlayer(page);

  const init = player.initAudioPlayer([]);
  await player.destroyAudioPlayer();
  started();
  await init;

  expect(service.select).not.toHaveBeenCalled();
  expect(service.registerUpdateListener).not.toHaveBeenCalled();
  // once by destroy, once more after the late start
  expect(service.stop).toHaveBeenCalledTimes(2);
});

test('initAudioPlayer selects the active audio when the page stays', async () => {
  const { page, service, started } = createPlayerMocks();
  const player = new ReactiveAudioPlayer(page);

  const init = player.initAudioPlayer([]);
  started();
  await init;

  expect(service.registerUpdateListener).toHaveBeenCalledTimes(1);
  expect(service.select).toHaveBeenCalledWith(0);
  expect(service.stop).not.toHaveBeenCalled();
});

// With ion-router-outlet the next page starts the shared player before the
// page it replaces is removed. The removed page's stop() then stopped the new
// page's player, whose select() failed in turn.
test('destroyAudioPlayer leaves the player to a page that started after it', async () => {
  const { page, mockAudioPlayerService } = createMocks();
  const starts: Array<() => void> = [];
  const service = Object.assign(mockAudioPlayerService, {
    start: vi.fn(() => new Promise<void>(resolve => starts.push(resolve))),
    stop: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockResolvedValue(undefined),
    registerUpdateListener: vi.fn(),
    unregisterUpdateListener: vi.fn(),
    getDuration: vi.fn().mockResolvedValue(0),
  });
  const leaving = new ReactiveAudioPlayer({ ...page });
  const entering = new ReactiveAudioPlayer({ ...page });

  const leavingInit = leaving.initAudioPlayer([]);
  const enteringInit = entering.initAudioPlayer([]);
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
  const { page, service, started } = createPlayerMocks();
  service.stop.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new TypeError("Cannot read properties of undefined (reading 'id')"));
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const player = new ReactiveAudioPlayer(page);

  const init = player.initAudioPlayer([]);
  await player.destroyAudioPlayer();
  started();

  await expect(init).resolves.toBeUndefined();
  expect(warn).toHaveBeenCalledTimes(1);
  warn.mockRestore();
});
