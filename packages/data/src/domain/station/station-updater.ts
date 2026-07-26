import { Storage } from '../../storage/index.js';
import { Updater } from '../../update/updater.js';
import { Station } from './station.js';

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
