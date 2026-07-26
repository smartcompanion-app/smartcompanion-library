import { Storage } from '../../storage/index.js';
import { Updater } from '../../update/updater.js';

export class ShareUpdater implements Updater {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async update(data: unknown) {
    if (typeof data === 'string') {
      this.storage.set('share', data);
    }
  }
}
