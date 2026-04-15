import { Storage } from '../../storage';
import { Updater } from '../../update';
import { Asset } from './asset';

export class AssetUpdater implements Updater {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async update(data: unknown) {
    if (Array.isArray(data)) {
      for (const asset of data as Asset[]) {
        this.storage.set(`asset-${asset.id}`, asset);
      }
      this.storage.set('assets', data);
    }
  }
}
