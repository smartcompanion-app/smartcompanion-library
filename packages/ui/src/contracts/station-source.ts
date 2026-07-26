import { Station } from '@smartcompanion/data';

/**
 * Station access as needed by pages, structurally satisfied by
 * the StationService of @smartcompanion/data.
 */
export interface StationSource {
  getStations(): Promise<Station[]>;
  getStation(stationId: string): Promise<Station>;
  updateCollectedPercentage(stationId: string, audioAssetId: string, collectedPercentage: number): Promise<Station>;
}
