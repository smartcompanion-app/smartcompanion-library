import { test, expect } from 'vitest';
import { Station } from '@smartcompanion/data';
import { StationPlaylist } from './station-playlist';

// station a: one audio, b: none, c: two audios, d: none
const stations = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] as Station[];
const items = [
  { id: 'a1', stationId: 'a' },
  { id: 'c1', stationId: 'c' },
  { id: 'c2', stationId: 'c' },
];
const playlist = new StationPlaylist(stations, items);

test('getStationIndexById finds the station or falls back to the first', () => {
  expect(playlist.getStationIndexById('c')).toBe(2);
  expect(playlist.getStationIndexById('default')).toBe(0);
  expect(playlist.getStationIndexById(null)).toBe(0);
});

test('getStationIndex maps every audio to its station', () => {
  expect([0, 1, 2].map(audioIndex => playlist.getStationIndex(audioIndex))).toEqual([0, 2, 2]);
  expect(playlist.getStationIndex(-1)).toBe(-1);
  expect(playlist.getStationIndex(3)).toBe(-1);
});

test('getAudioIndex maps a station to its first audio, or -1 without audio', () => {
  expect([0, 1, 2, 3].map(stationIndex => playlist.getAudioIndex(stationIndex))).toEqual([0, -1, 1, -1]);
  expect(playlist.hasAudio(0)).toBe(true);
  expect(playlist.hasAudio(1)).toBe(false);
});

test('getNextAudioIndex skips stations without audio and wraps around', () => {
  expect(playlist.getNextAudioIndex(1)).toBe(1);
  expect(playlist.getNextAudioIndex(3)).toBe(0);
});

test('getPrevAudioIndex goes to the last audio of an earlier station and wraps around', () => {
  expect(playlist.getPrevAudioIndex(3)).toBe(2);
  expect(playlist.getPrevAudioIndex(1)).toBe(0);
  expect(playlist.getPrevAudioIndex(0)).toBe(2);
});

test('without any audio there is nothing to go to', () => {
  const silent = new StationPlaylist(stations, []);
  expect(silent.getNextAudioIndex(0)).toBe(-1);
  expect(silent.getPrevAudioIndex(0)).toBe(-1);
});
