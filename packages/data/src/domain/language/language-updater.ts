import { Storage } from "../../storage";
import { Updater } from "../../update";

export class LanguageUpdater implements Updater {

    protected storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    async update(data: any) {
        if (Array.isArray(data)) {
            this.storage.set('languages', data);
        }                    
    }    
}
