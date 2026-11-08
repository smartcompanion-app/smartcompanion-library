import { test, beforeEach, expect, vi } from 'vitest';
import { Station } from '@smartcompanion/data';
import { AudioPlayerUpdate } from '../src/services/audio-player-service/audio-player-update';

// Every listener the plugin holds, so a test can send the events the player would,
// and see a listener that was registered twice or never removed
type Listener = (result: unknown) => Promise<void>;
const listeners: Record<string, Listener[]> = {};
const removed: string[] = [];

vi.mock('@smartcompanion/native-audio-player', () => ({
  NativeAudioPlayer: {
    start: vi.fn().mockResolvedValue({ id: 'a1' }),
    getDuration: vi.fn().mockResolvedValue({ value: 10 }),
    addListener: vi.fn(async (eventName: string, listener: Listener) => {
      (listeners[eventName] ??= []).push(listener);
      return {
        remove: async () => {
          listeners[eventName] = listeners[eventName].filter(l => l !== listener);
          removed.push(eventName);
        },
      };
    }),
  },
}));

const { AudioPlayerService } = await import('../src/services/audio-player-service/audio-player-service');
const { CollectibleAudioPlayerService } = await import('../src/services/audio-player-service/collectible-audio-player-service');

const stations = [
  { id: 'a', title: 'a', images: [], audios: [{ id: 'a1' }] },
  { id: 'b', title: 'b', images: [], audios: [{ id: 'b1' }] },
] as unknown as Station[];

const emit = async (eventName: string, result: unknown) => {
  for (const listener of listeners[eventName] ?? []) {
    await listener(result);
  }
};
const change = (state: string, id: string) => emit('audioPlayerChange', { state, id });
const progress = (position: number, id = 'a1') => emit('progress', { id, position, duration: 10 });
const listenerCount = () => Object.values(listeners).reduce((count, l) => count + l.length, 0);

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
  expect(listenerCount()).toBe(0);
});

test('registering again replaces the listeners of the previous registration', async () => {
  const service = new AudioPlayerService('');
  const first: AudioPlayerUpdate[] = [];
  const second: AudioPlayerUpdate[] = [];
  await service.registerUpdateListener(update => first.push(update));
  await service.registerUpdateListener(update => second.push(update));

  await change('playing', 'a1');
  await progress(1);

  expect(listenerCount()).toBe(2);
  expect(first).toEqual([]);
  expect(second.map(update => update.state)).toEqual(['playing', 'progress']);
});

test('unregistering while the listeners are still being added removes them all', async () => {
  const service = new AudioPlayerService('');

  const registering = service.registerUpdateListener(() => {});
  await service.unregisterUpdateListener();
  await registering;

  expect(listenerCount()).toBe(0);
});

const startCollecting = async () => {
  const collection: Record<string, { collectedTime: number; collectedPercentage: number; duration: number }> = {};
  const service = new CollectibleAudioPlayerService('', collection);
  await service.start(stations);
  const collected: AudioPlayerUpdate[] = [];
  await service.registerUpdateListener(update => {
    if (update.state == 'collected') {
      collected.push(update);
    }
  });
  await settle();
  return { service, collection, collected };
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

test('listening time does not carry over the end of a completed audio into playing it again', async () => {
  const { collection, collected } = await startCollecting();

  await change('playing', 'a1');
  await settle();
  await progress(1);
  await progress(9);
  await change('completed', 'a1');
  await change('playing', 'a1');
  await progress(0.5);

  expect(collection.a1.collectedTime).toBe(8);
  expect(collected).toEqual([{ state: 'collected', id: 'a1', index: 0, percentage: 0.8 }]);
});

test('a page that took over the player collects each progress once', async () => {
  // The page left behind is not the owner any more, so it never unregisters
  const { service } = await startCollecting();
  const collected: AudioPlayerUpdate[] = [];
  await service.registerUpdateListener(update => {
    if (update.state == 'collected') {
      collected.push(update);
    }
  });
  await settle();

  await change('playing', 'a1');
  await settle();
  await progress(1);
  await progress(3);

  expect(collected).toEqual([{ state: 'collected', id: 'a1', index: 0, percentage: 0.2 }]);
});

test('a progress that arrives after unregistering collects without anyone to tell', async () => {
  const { service } = await startCollecting();
  await change('playing', 'a1');
  await settle();
  await progress(1);

  await service.unregisterUpdateListener();

  await expect(service.updatePosition(3)).resolves.toBeUndefined();
});
