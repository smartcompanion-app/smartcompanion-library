import { AudioPlayerState } from '@smartcompanion/native-audio-player';

export interface AudioPlayerUpdate {
  /**
   * A state of the player, 'progress' for the playhead while playing, or
   * 'collected' for how much of an audio was listened to
   */
  state: AudioPlayerState | 'progress' | 'collected';
  index: number;
  id: string;

  percentage?: number; // optional, only for "collected" event/state
  position?: number; // optional, only for "progress" event/state
  duration?: number; // optional, only for "progress" event/state
}
