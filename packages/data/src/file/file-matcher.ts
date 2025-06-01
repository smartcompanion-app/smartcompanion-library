export class FileMatcher {

    match(oldFiles: string[], newFiles: string[]): {"remove": string[], "download": string[]} {
        return {
            "remove": this.getFilesToRemove(oldFiles, newFiles),
            "download": this.getFilesToDownload(oldFiles, newFiles)
        };
    }

    getFilesToDownload(oldFiles: string[], newFiles: string[]): string[] {
        return newFiles.filter(file => oldFiles.indexOf(file) == -1);
    }

    getFilesToRemove(oldFiles: string[], newFiles: string[]): string[] {
        return oldFiles.filter(file => newFiles.indexOf(file) == -1);
    }
}
