import { test, expect, vi, beforeEach } from 'vitest';
import { ReactiveAudioPlayer } from './reactive-audio-player';
import { ServiceFacade } from '@smartcompanion/services';

const store: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  get length() { return Object.keys(store).length; },
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
  } as unknown as ServiceFacade;

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
