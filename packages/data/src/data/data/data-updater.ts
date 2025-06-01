import { Storage } from "../../storage";
import { Updater } from "../updater";
import { 
    AssetUpdater,
    StationUpdater,
    LanguageUpdater,
    TextUpdater,
    PinUpdater,
    TourUpdater,
    ServerUpdater
} from "../";

export class DataUpdater implements Updater {

    protected storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    requiresUpdate(data: any): boolean {
        return data && (!this.storage.has('checksum') || this.storage.get('checksum') != data['checksum']);
    }

    getUpdaters(data: any): any {       
        const updaters: any = {};
        
        for (const updaterKey in data) {
            switch (updaterKey) {
                case "assets":
                    updaters[updaterKey] = new AssetUpdater(this.storage);
                    break;
                case "stations":
                    updaters[updaterKey] = new StationUpdater(this.storage);
                    break;
                case "texts":
                    updaters[updaterKey] = new TextUpdater(this.storage);
                    break;
                case "languages":
                    updaters[updaterKey] = new LanguageUpdater(this.storage);
                    break;
                case "pins":
                    updaters[updaterKey] = new PinUpdater(this.storage);
                    break;
                case "tours":
                    updaters[updaterKey] = new TourUpdater(this.storage);
                    break;
                case "servers":
                    updaters[updaterKey] = new ServerUpdater(this.storage);
                    break;
            }
        }

        return updaters;
    }

    async update(data: any) {
        if (this.requiresUpdate(data)) {
            const updaters = this.getUpdaters(data);
            for (const updaterKey in updaters) {
                updaters[updaterKey].update(data[updaterKey]);
            }
            this.storage.set('checksum', data['checksum']);
        }
    }

}