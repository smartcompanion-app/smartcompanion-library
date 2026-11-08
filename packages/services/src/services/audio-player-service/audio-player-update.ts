import { AudioPlayerState } from '@smartcompanion/native-audio-player';

interface AudioPlayerUpdateBase {
  index: number;
  id: string;
}

/**
 * A state change of the player
 */
export interface AudioPlayerStateUpdate extends AudioPlayerUpdateBase {
  state: AudioPlayerState;
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
