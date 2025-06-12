import { Storage } from "../storage";
import { Updater } from "./updater";

import {
	AssetUpdater,
	StationUpdater,
	LanguageUpdater,
	TextUpdater,
	PinUpdater,
	TourUpdater,
	ServerUpdater
} from "../";

/**
 * Based on the provided data, updates on the storage are processed.
 * The updates on the storage are done by the registered updaters.
 */
export class UpdateProcessor {

	protected storage: Storage;
  protected updaters: {[key: string]: Updater} = {};

	constructor(storage: Storage) {
		this.storage = storage;
	}

  registerUpdater(name: string, updater: Updater) {
    this.updaters[name] = updater;
  }

	requiresUpdate(data: any): boolean {
		return data && (!this.storage.has('checksum') || this.storage.get('checksum') != data['checksum']);
	}

	async update(data: any) {
		if (this.requiresUpdate(data)) {
      for (const updaterKey in data) {
        if (updaterKey in this.updaters) {
          this.updaters[updaterKey].update(data[updaterKey]);
        }
      }
			this.storage.set('checksum', data['checksum']);
		}
	}
}
