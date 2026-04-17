import { AssetService, Station } from '..';
import { Storage } from '../../storage';

export class StationService {
  protected storage: Storage;
  protected assetService: AssetService;

  constructor(storage: Storage, assetService: AssetService) {
    this.storage = storage;
    this.assetService = assetService;
  }

  getLanguage(): string {
    if (!this.storage.has('language')) {
      return 'en'; // default set en for stations
    } else {
      return this.storage.get('language') as string;
    }    
  }

  /**
   * Get Stations without resolving assets
   */
  getUnresolvedStations(): Station[] {
    return this.storage.get(`stations-${this.getLanguage()}`) as Station[];
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
    const storageKey = `station-${this.getLanguage()}-${stationId}`;

    if (!this.storage.has(storageKey)) {
      throw new Error(`station with id ${stationId} not found`);
    }

    const station = this.storage.get(storageKey) as Station;

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
    const storageKey = `station-${this.getLanguage()}-${stationId}`;

    if (this.storage.has(storageKey)) {
      const station = this.storage.get(storageKey) as Station;

      // currently only a 1-to-1 correspondence between audio and station is supported
      if (station?.audios?.length == 1 && station?.audios[0] == audioAssetId) {
        const stations = this.storage.get(`stations-${this.getLanguage()}`) as Station[];
        station.collectedPercentage = collectedPercentage;
        this.storage.set(storageKey, station);
        this.storage.set(
          `stations-${this.getLanguage()}`,
          stations.map((s: Station) => (s.id == stationId ? station : s)),
        );
      }
    }    

    return this.getStation(stationId);
  }

  clearCollectedPercentage(language: string) {
    if (this.storage.has(`stations-${language}`)) {
      const stations = this.storage.get(`stations-${language}`) as Station[];
      this.storage.set(
        `stations-${language}`,
        stations.map((s: Station) => {
          s.collectedPercentage = 0;
          this.storage.set(`station-${language}-${s.id}`, s);
          return s;
        }),
      );
    }
  }
}
