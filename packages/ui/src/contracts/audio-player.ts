import { Station } from '@smartcompanion/data';

export interface AudioPlayerUpdate {
  state: string;
  index: number;
  id: string;

  percentage?: number; // optional, only for "collected" event/state
}

export interface AudioPlayerItem {
  id: string;
  stationId: string;
}

/**
 * Audio playback as needed by pages and the ReactiveAudioPlayer,
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
  getPosition(): Promise<number>;
  getStationId(index: number): string;
  getIndexByStationId(stationId: string, items?: Array<{ stationId: string }>): number;
  getPlayerItems(stations: Station[]): AudioPlayerItem[];
}
