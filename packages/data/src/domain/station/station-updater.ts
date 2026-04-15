import { Storage } from '../../storage';
import { Updater } from '../../update';
import { Station } from './station';

export class StationUpdater implements Updater {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async update(data: unknown) {
    const languageFilteredStations: Record<string, Station[]> = {};

    if (Array.isArray(data)) {
      for (const station of data as Station[]) {
        if (!languageFilteredStations[station.language]) {
          languageFilteredStations[station.language] = [];
        }
        languageFilteredStations[station.language].push(station);
        this.storage.set(`station-${station.language}-${station.id}`, station);
      }

      for (const language in languageFilteredStations) {
        this.storage.set(`stations-${language}`, languageFilteredStations[language]);
      }
    }
  }
}
