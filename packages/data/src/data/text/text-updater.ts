import { Storage } from "../../storage";
import { Updater } from "../updater";

export class TextUpdater implements Updater {

    protected storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    async update(data: any) {
        if (Array.isArray(data)) {
            for (let text of data) {
                this.storage.set(`texts-${text.language}-${text.key}`, text.value);                
            }
        }        
    }
    
}