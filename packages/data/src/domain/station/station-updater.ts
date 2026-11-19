import { Storage } from '../../storage/index.js';
import { Updater } from '../../update/updater.js';
import { replaceLanguageLists } from '../../update/language-lists.js';
import { Station } from './station.js';

export class StationUpdater implements Updater {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  /**
   * Stores the stations per language; stations no longer in the data are removed.
   */
  async update(data: unknown) {
    if (Array.isArray(data)) {
      replaceLanguageLists(this.storage, data as Station[], 'station', 'stations');
    }
  }
}
