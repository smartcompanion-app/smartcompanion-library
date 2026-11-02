import { test, beforeEach, expect, vi } from 'vitest';
import { Station } from '@smartcompanion/data';
import { AudioPlayerUpdate } from '../src/services/audio-player-service/audio-player-update';

// The plugin's listeners, so a test can send the events the player would
const listeners: Record<string, (result: unknown) => Promise<void>> = {};
const removed: string[] = [];

vi.mock('@smartcompanion/native-audio-player', () => ({
  NativeAudioPlayer: {
    start: vi.fn().mockResolvedValue({ id: 'a1' }),
    getDuration: vi.fn().mockResolvedValue({ value: 10 }),
    addListener: vi.fn(async (eventName: string, listener: (result: unknown) => Promise<void>) => {
      listeners[eventName] = listener;
      return { remove: async () => removed.push(eventName) };
    }),
  },
}));

const { AudioPlayerService } = await import('../src/services/audio-player-service/audio-player-service');
const { CollectibleAudioPlayerService } = await import('../src/services/audio-player-service/collectible-audio-player-service');

const stations = [
  { id: 'a', title: 'a', images: [], audios: [{ id: 'a1' }] },
  { id: 'b', title: 'b', images: [], audios: [{ id: 'b1' }] },
] as unknown as Station[];

const change = (state: string, id: string) => listeners.audioPlayerChange({ state, id });
const progress = (position: number, id = 'a1') => listeners.progress({ id, position, duration: 10 });

// initCollection() fetches the duration without waiting for it
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

beforeEach(() => {
  Object.keys(listeners).forEach(key => delete listeners[key]);
  removed.length = 0;
});

test('the playhead reaches the listener as a progress update', async () => {
  const service = new AudioPlayerService('');
  await service.start(stations);
  const updates: AudioPlayerUpdate[] = [];
  await service.registerUpdateListener(update => updates.push(update));

  await progress(4.5, 'b1');

  expect(updates).toEqual([{ state: 'progress', id: 'b1', index: 1, position: 4.5, duration: 10 }]);
});

test('unregistering removes the progress listener too', async () => {
  const service = new AudioPlayerService('');
  await service.registerUpdateListener(() => {});

  await service.unregisterUpdateListener();

  expect(removed).toEqual(['audioPlayerChange', 'progress']);
});

const startCollecting = async () => {
  const service = new CollectibleAudioPlayerService('');
  await service.start(stations);
  const collected: AudioPlayerUpdate[] = [];
  await service.registerUpdateListener(update => {
    if (update.state == 'collected') {
      collected.push(update);
    }
  });
  await settle();
  return { collected };
};

test('listening time is collected from the progress of the playing audio', async () => {
  const { collected } = await startCollecting();

  await change('playing', 'a1');
  await settle();
  await progress(1);
  await progress(3);

  expect(collected).toEqual([{ state: 'collected', id: 'a1', index: 0, percentage: 0.2 }]);
});

test('listening time does not carry over a stop', async () => {
  const { collected } = await startCollecting();

  await change('playing', 'a1');
  await settle();
  await progress(1);
  await change('stopped', 'a1');
  await change('playing', 'a1');
  await progress(6);

  expect(collected).toEqual([]);
});

test('listening time does not carry over a skip', async () => {
  const { collected } = await startCollecting();

  await change('playing', 'a1');
  await settle();
  await progress(1);
  await change('skipped', 'b1');
  await change('playing', 'b1');
  await settle();
  await progress(6, 'b1');
  await progress(7, 'b1');

  expect(collected).toEqual([{ state: 'collected', id: 'b1', index: 1, percentage: 0.1 }]);
});
