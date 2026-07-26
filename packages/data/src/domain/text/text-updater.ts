import { Storage } from '../../storage/index.js';
import { Updater } from '../../update/updater.js';

export class TextUpdater implements Updater {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async update(data: unknown) {
    if (Array.isArray(data)) {
      for (const text of data as Array<{ language: string; key: string; value: string }>) {
        this.storage.set(`texts-${text.language}-${text.key}`, text.value);
      }
    }
  }
}
