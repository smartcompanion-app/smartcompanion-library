import { Storage } from "../../storage";
import { Updater } from "../updater";

export class StationUpdater implements Updater {

    protected storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    async update(data: any) {
        let languageFilteredStations:any = {};

        if (Array.isArray(data)) {
            for (let station of data) {
                if (!languageFilteredStations[station.language]) {
                    languageFilteredStations[station.language] = [];
                }
                languageFilteredStations[station.language].push(station);
                this.storage.set(`station-${station.language}-${station.id}`, station);
            }
    
            for (let language in languageFilteredStations) {
                this.storage.set(`stations-${language}`, languageFilteredStations[language]);
            } 
        }                   
    }    
}
