import { Storage } from '../../storage/index.js';
import { Updater } from '../../update/updater.js';

export class LanguageUpdater implements Updater {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async update(data: unknown) {
    if (Array.isArray(data)) {
      this.storage.set('languages', data);
    }
  }
}
