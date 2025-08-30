import { PluginListenerHandle } from '@capacitor/core';
import { NativeAudioPlayer, Item } from '@smartcompanion/native-audio-player';
import { Station, Asset } from "@smartcompanion/data";
import { AudioPlayerUpdate } from "./audio-player-update";

export class AudioPlayerService {

  protected items: Item[] = [];
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

  getIndex(id: String | string, items: Array<{id: string}> = this.items): number {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id == id) {
        return i;
      }
    }
    return -1;
  }

  getId(index: number): string {
    if (this.items && index < this.items.length && index >= 0) {
      return this.items[index].id;
    }
    return "";
  }

  getPlayerItems(stations: Station[]): Item[] {
    return stations
      .map(station => (station.audios as Asset[])
        .map(audio => ({
          id: audio.id,
          title: audio?.title ? audio?.title : station.title,
          subtitle: this.subtitle,
          audioUri: audio.internalFileUrl,
          imageUri: (station.images as Asset[])[0].internalFileUrl
        })))
      .flat();
  }
}
