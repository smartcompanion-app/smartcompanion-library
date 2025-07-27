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
} from "../domain";

/**
 * Based on the provided data, updates on the storage are processed.
 * The updates on the storage are done by the registered updaters.
 */
export class DataUpdater implements Updater {

	protected storage: Storage;
  protected updaters: {[key: string]: Updater} = {};

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
