import { Station } from "@smartcompanion/data";
import { AudioPlayerUpdate } from "./audio-player-update";

export interface AudioService {

  start(stations: Station[]): Promise<void>;

  stop(): Promise<void>;

  select(index: number): Promise<void>;

  play(): Promise<void>;

  pause(): Promise<void>;

  seek(position: number): Promise<void>;

  next(): Promise<void>

  prev(): Promise<void>

  registerUpdateListener(callback: (update: AudioPlayerUpdate) => void): void;

  unregisterUpdateListener(): Promise<void>;

  setEarpiece(): Promise<void>;

  setSpeaker(): Promise<void>;

  getDuration(): Promise<number>;

  getPosition(): Promise<number>;

  getIndex(id: String | string, items: Array<{
    id: string;
    title: string;
    subtitle: string;
    audioUri: string;
    imageUri: string;
  }>): number;

  getId(index: number): string;

  getPlayerItems(stations: Station[]): any[];
}
