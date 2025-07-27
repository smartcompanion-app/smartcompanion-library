import { AssetService, Station } from "..";
import { Storage } from "../../storage";

export class StationService {

  protected storage: Storage;
  protected assetService: AssetService;

  constructor(storage: Storage, assetService: AssetService) {
    this.storage = storage;
    this.assetService = assetService;
  }

  getLanguage(): string {
    return this.storage.get('language');
  }

  /**
   * Get Stations without resolving assets
   */
  getUnresolvedStations(): Station[] {
    return this.storage.get(`stations-${this.getLanguage()}`);
  }

  async getStations(): Promise<Station[]> {
    const stations: Station[] = this.getUnresolvedStations();
    const result: Station[] = [];

    for (const station of stations) {
      const resovedStation = await this.getStation(station.id);
      result.push(resovedStation);
    }

    return result;
  }

  async getStation(stationId: string): Promise<Station> {
    const station: Station = this.storage.get(`station-${this.getLanguage()}-${stationId}`);

    if (station && station.images) {
      for (let i = 0; i < station.images.length; i++) {
        station.images[i] = await this.assetService.getAsset(station.images[i] as string);
      }
    }

    if (station && station.audios) {
      for (let a = 0; a < station.audios.length; a++) {
        station.audios[a] = await this.assetService.getAsset(station.audios[a] as string);
      }
    }

    return station;
  }

  updateCollectedPercentage(stationId: string, audioAssetId: string, collectedPercentage: number): Promise<Station> {
    if (this.storage.has(`station-${this.getLanguage()}-${stationId}`)) {
      const station: Station = this.storage.get(`station-${this.getLanguage()}-${stationId}`);
    
      // currently only a 1-to-1 correspondence between audio and station is supported
      if (station?.audios?.length == 1 && station?.audios[0] == audioAssetId) {
        const stations: Station[] = this.storage.get(`stations-${this.getLanguage()}`);
        station.collectedPercentage = collectedPercentage;
        this.storage.set(`station-${this.getLanguage()}-${stationId}`, station);
        this.storage.set(`stations-${this.getLanguage()}`, stations.map((s: Station) => s.id == stationId ? station : s));
      }
    }

    return this.getStation(stationId);
  }

  clearCollectedPercentage(language: string) {
    if (this.storage.has(`stations-${language}`)) {
      const stations: Station[] = this.storage.get(`stations-${language}`);
      this.storage.set(`stations-${language}`, stations.map((s: Station) => {
        s.collectedPercentage = 0;
        this.storage.set(`station-${language}-${s.id}`, s);
        return s;
      }));
    }
  }
}
