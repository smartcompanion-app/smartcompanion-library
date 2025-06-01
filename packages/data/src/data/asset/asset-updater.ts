import { Storage } from "../../storage";
import { Updater } from "../updater";

export class AssetUpdater implements Updater {

    protected storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    async update(data: any) {
        if (Array.isArray(data)) {
            for (let asset of data) {
                this.storage.set(`asset-${asset.id}`, asset);
            }
            this.storage.set('assets', data);
        }    
    }    
}
