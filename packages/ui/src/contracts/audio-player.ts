import { Station } from '@smartcompanion/data';

interface AudioPlayerUpdateBase {
  index: number;
  id: string;
}

/**
 * A state change of @smartcompanion/native-audio-player
 */
export interface AudioPlayerStateUpdate extends AudioPlayerUpdateBase {
  state: 'playing' | 'paused' | 'stopped' | 'skipped' | 'completed';
}

/**
 * The playhead, reported while the player plays
 */
export interface AudioPlayerProgressUpdate extends AudioPlayerUpdateBase {
  state: 'progress';
  position: number;
  duration: number;
}

/**
 * How much of an audio was listened to
 */
export interface AudioPlayerCollectedUpdate extends AudioPlayerUpdateBase {
  state: 'collected';
  percentage: number;
}

/**
 * Narrow on `state` to reach the fields of a 'progress' or 'collected' update
 */
export type AudioPlayerUpdate = AudioPlayerStateUpdate | AudioPlayerProgressUpdate | AudioPlayerCollectedUpdate;

export interface AudioPlayerItem {
  id: string;
  stationId: string;
}

/**
 * Audio playback as needed by pages and the audioPlayerComponent mixin,
 * structurally satisfied by the AudioPlayerService of @smartcompanion/services.
 */
export interface AudioPlayer {
  start(stations: Station[]): Promise<void>;
  stop(): Promise<void>;
  select(index: number): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(position: number): Promise<void>;
  next(): Promise<void>;
  prev(): Promise<void>;
  registerUpdateListener(callback: (update: AudioPlayerUpdate) => void): Promise<void>;
  unregisterUpdateListener(): Promise<void>;
  setEarpiece(): Promise<void>;
  setSpeaker(): Promise<void>;
  getDuration(): Promise<number>;
  getStationId(index: number): string;
  getIndexByStationId(stationId: string, items?: Array<{ stationId: string }>): number;
  getNextIndexByStationId(stationId: string, stations: Station[]): number;
  getPrevIndexByStationId(stationId: string, stations: Station[]): number;
  getPlayerItems(stations: Station[]): AudioPlayerItem[];
}
