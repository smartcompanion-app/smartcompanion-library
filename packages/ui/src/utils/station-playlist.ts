import { Station } from '@smartcompanion/data';
import { AudioPlayerItem } from '../contracts';

/**
 * Maps between a page's list of stations and the audio player's playlist.
 *
 * The playlist has one item per audio: a station with several audios has
 * several items, a station without audio has none. A station's position in
 * the list is therefore not its position in the playlist, and the two are
 * mapped through the station id.
 */
export class StationPlaylist {
  private stationIds: string[];
  private itemStationIds: string[];

  constructor(stations: Station[], items: AudioPlayerItem[]) {
    this.stationIds = stations.map(station => station.id);
    this.itemStationIds = items.map(item => item.stationId);
  }

  /**
   * Index in the list of the station with the given id, or of the first station if there is none
   */
  getStationIndexById(stationId: string): number {
    return Math.max(this.stationIds.indexOf(stationId), 0);
  }

  /**
   * Index in the list of the station the playlist item belongs to, -1 if there is no such item
   */
  getStationIndex(audioIndex: number): number {
    return audioIndex >= 0 && audioIndex < this.itemStationIds.length ? this.stationIds.indexOf(this.itemStationIds[audioIndex]) : -1;
  }

  /**
   * Index in the playlist of the station's first audio, -1 if the station has no audio
   */
  getAudioIndex(stationIndex: number): number {
    return stationIndex >= 0 && stationIndex < this.stationIds.length ? this.itemStationIds.indexOf(this.stationIds[stationIndex]) : -1;
  }

  hasAudio(stationIndex: number): boolean {
    return this.getAudioIndex(stationIndex) >= 0;
  }

  /**
   * Index in the playlist of the first audio after the given station, wrapping
   * around to the first audio like the player does, -1 if there is no audio at all
   */
  getNextAudioIndex(stationIndex: number): number {
    for (let audioIndex = 0; audioIndex < this.itemStationIds.length; audioIndex++) {
      if (this.getStationIndex(audioIndex) > stationIndex) {
        return audioIndex;
      }
    }
    return this.itemStationIds.length > 0 ? 0 : -1;
  }

  /**
   * Index in the playlist of the last audio before the given station, wrapping
   * around to the last audio like the player does, -1 if there is no audio at all
   */
  getPrevAudioIndex(stationIndex: number): number {
    for (let audioIndex = this.itemStationIds.length - 1; audioIndex >= 0; audioIndex--) {
      if (this.getStationIndex(audioIndex) < stationIndex) {
        return audioIndex;
      }
    }
    return this.itemStationIds.length - 1;
  }
}
