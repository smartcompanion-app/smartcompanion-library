import { PluginListenerHandle } from '@capacitor/core';
import { NativeAudioPlayer, Item } from '@smartcompanion/native-audio-player';
import { Station, Asset } from "@smartcompanion/data";
import { AudioPlayerUpdate } from "./audio-player-update";

export interface AudioPlayerServiceItem extends Item {
  stationId: string;
  collectedPercentage: number;
}

export class AudioPlayerService {

  protected items: AudioPlayerServiceItem[] = [];
  protected updateListenerHandle: PluginListenerHandle;

  set stations(stations: Station[]) {
    this.items = this.getPlayerItems(stations);
  }

  constructor(protected subtitle: string) {
  }

  async start(stations: Station[]) {
    this.stations = stations;
    await NativeAudioPlayer.start({ items: this.items })
  }

  async stop() {
    await NativeAudioPlayer.stop();
  }

  async select(index: number) {
    await NativeAudioPlayer.select({ id: this.getId(index) });
  }

  async play() {
    await NativeAudioPlayer.play();
  }

  async pause() {
    await NativeAudioPlayer.pause();
  }

  async seek(position: number) {
    await NativeAudioPlayer.seekTo({ position: position });
  }

  async next() {
    await NativeAudioPlayer.next();
  }

  async prev() {
    await NativeAudioPlayer.previous();
  }

  async registerUpdateListener(callback: (update: AudioPlayerUpdate) => void) {
    this.updateListenerHandle = await NativeAudioPlayer.addListener("update", async (result) => {
      callback({
        state: result.state,
        id: result.id,
        index: this.getIndex(result.id)
      });
    });
  }

  async unregisterUpdateListener() {
    if (this.updateListenerHandle) {
      await this.updateListenerHandle.remove();
    }
  }

  setEarpiece() {
    return NativeAudioPlayer.setEarpiece();
  }

  setSpeaker() {
    return NativeAudioPlayer.setSpeaker();
  }

  async getDuration(): Promise<number> {
    const result = await NativeAudioPlayer.getDuration();
    return result.value;
  }

  async getPosition(): Promise<number> {
    const result = await NativeAudioPlayer.getPosition();
    return result.value;
  }

  /**
   * Get the index of the item identified by the given audio id
   */
  getIndex(id: string): number {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].id == id) {
        return i;
      }
    }
    // fallback to first item
    return 0;
  }

  /**
   * Get the index of the first item identified by the given station id 
   */
  getIndexByStationId(stationId: string, items: Array<{stationId: string}> = this.items): number {
    if (stationId == "default") {
      return 0;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].stationId == stationId) {
        return i;
      }
    }

    // fallback to first item
    return 0;
  }

  /**
   * Get the station id of the item at the given index
   */
  getStationId(index: number): string {
    if (this.items && index < this.items.length && index >= 0) {
      return this.items[index].stationId;
    }
    return "";
  }

  getId(index: number): string {
    if (this.items && index < this.items.length && index >= 0) {
      return this.items[index].id;
    }
    return "";
  }

  /**
   * Convert stations to player items, each item is identified by their audio id
   * A station with multiple audios will be split into multiple items
   */
  getPlayerItems(stations: Station[]): AudioPlayerServiceItem[] {
    return stations
      .map(station => (station.audios as Asset[])
        .map(audio => ({
          id: audio.id,
          title: audio?.title ? audio?.title : station.title,
          subtitle: this.subtitle,
          audioUri: audio.internalFileUrl,
          imageUri: (station.images as Asset[])[0].internalFileUrl,
          stationId: station.id,
          collectedPercentage: station.collectedPercentage || 0
        })))
      .flat();
  }
}
