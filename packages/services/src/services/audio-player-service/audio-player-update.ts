export interface AudioPlayerUpdate {
  state: string;
  index: number;
  id: string;

  percentage?: number; // optional, only for "collected" event/state
}
