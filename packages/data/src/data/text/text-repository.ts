import { Storage } from "../../storage";

export class TextRepository {

    protected storage: Storage;
    protected cache: any;

    constructor(storage: Storage) {
        this.storage = storage;
        this.cache = {};
    } 

    getCurrentLanguage() {
        const language = this.storage.get('language');

        if (!language) {
            return "en"; // default set en for texts
        } else {
            return language;
        }        
    }

    getText(key: string): string {       
        const language = this.getCurrentLanguage();        
        const storageKey = `texts-${language}-${key}`;
        if (this.cache[storageKey]) return this.cache[storageKey];

        if (this.storage.has(storageKey)) {
            this.cache[storageKey] = this.storage.get(storageKey);
            return this.getText(key);
        }      

        return key.replace('_', ' ').toLowerCase();
    }

}
