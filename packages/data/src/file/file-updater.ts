import { FileMatcher } from "./file-matcher";
import { Storage } from "../storage";
import { File } from "./file";

export class FileUpdater {

    protected fileMatcher = new FileMatcher();
    protected download: (url:string) => Promise<string>;
    protected remove: (filename:string) => Promise<void>;
    protected save: (filename:string, data:string) => Promise<void>;
    protected list: () => Promise<string[]>;
    protected progress: (progress: number) => void;
    protected storage: Storage;

    constructor(
        download: (url:string) => Promise<string>,
        remove: (filename:string) => Promise<void>,
        save: (filename:string, data:string) => Promise<void>,
        list: () => Promise<string[]>,
        progress: (progress: number) => void,
        storage: Storage
    ) {
        this.download = download;
        this.remove = remove;
        this.save = save;
        this.list = list;
        this.progress = progress;
        this.storage = storage;
    }

    async update(newFiles: File[]) {
        const oldFiles = await this.list();
        const matching = this.fileMatcher.match(oldFiles, newFiles.map(file => file.filename));
        const filesToDownload = newFiles.filter(file => matching.download.indexOf(file.filename) >= 0);        
        await this.removeFiles(matching.remove);
        await this.downloadFiles(filesToDownload);              
    }

    async removeFiles(filesToRemove:string[]) {
        for (let fileToRemove of filesToRemove) {
            await this.remove(fileToRemove);
        }
    }

    async downloadFiles(files:File[]) {     
        for (let f = 0; f < files.length; f++) {
            const content = await this.download(files[f].externalUrl);
            await this.save(files[f].filename, content);
            this.progress(Math.trunc(( (f+1) / files.length ) * 100));
        }        
    }
}
