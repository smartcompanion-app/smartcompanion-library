import { Storage } from '../storage';
import { Updater } from './updater';

import { AssetUpdater, StationUpdater, LanguageUpdater, TextUpdater, PinUpdater, TourUpdater, ServerUpdater, ShareUpdater } from '../domain';

/**
 * Based on the provided data, updates on the storage are processed.
 * The updates on the storage are done by the registered updaters.
 */
export class DataUpdater implements Updater {
  protected storage: Storage;
  protected updaters: { [key: string]: Updater } = {};

  constructor(storage: Storage) {
    this.storage = storage;

    // register default updaters
    this.registerUpdater('assets', new AssetUpdater(this.storage));
    this.registerUpdater('stations', new StationUpdater(this.storage));
    this.registerUpdater('languages', new LanguageUpdater(this.storage));
    this.registerUpdater('texts', new TextUpdater(this.storage));
    this.registerUpdater('pins', new PinUpdater(this.storage));
    this.registerUpdater('tours', new TourUpdater(this.storage));
    this.registerUpdater('servers', new ServerUpdater(this.storage));
    this.registerUpdater('share', new ShareUpdater(this.storage));
  }

  registerUpdater(name: string, updater: Updater) {
    this.updaters[name] = updater;
  }

  requiresUpdate(data: Record<string, unknown>): boolean {
    return !this.storage.has('checksum') || (this.storage.get('checksum') !== data['checksum']);
  }

  isPlainObject(data: unknown): data is Record<string, unknown> {
    return Object.prototype.toString.call(data) === '[object Object]';
  }

  isValidDataObject(data: unknown): data is Record<string, unknown> {
    return (
      this.isPlainObject(data) &&
      typeof data['checksum'] === 'string' &&
      ['assets', 'stations', 'languages', 'texts'].every(key => Array.isArray(data[key]))
    );
  }

  async update(data: unknown) {
    if (this.isValidDataObject(data) && this.requiresUpdate(data)) {
      const updates: Promise<void>[] = [];
      for (const updaterKey in data) {
        if (updaterKey in this.updaters) {
          updates.push(this.updaters[updaterKey].update(data[updaterKey]));
        }
      }
      await Promise.all(updates);
      this.storage.set('checksum', data['checksum']);
    }
  }
}
