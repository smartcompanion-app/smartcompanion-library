import { Storage } from '../../storage/index.js';

export class ShareService {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  hasShare(): boolean {
    return this.storage.has('share');
  }

  getShare(): string {
    if (this.hasShare()) {
      return this.storage.get('share') as string;
    }
    throw new Error('There is no share defined');
  }
}
