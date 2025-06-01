import { Storage } from "../../storage";
import { Updater } from "../updater";

export class ServerUpdater implements Updater {

    protected storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    async update(data: any) {
        if (Array.isArray(data)) {            
            this.storage.set('servers', data);
        }    
    }    
}
