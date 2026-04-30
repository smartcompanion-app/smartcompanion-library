import { Storage } from '../../storage';
import { Updater } from '../../update';

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
