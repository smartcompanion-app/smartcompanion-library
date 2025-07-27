import { FileMatcher } from "./file-matcher";
import { File } from "./file";

export class FileUpdater {

  protected fileMatcher = new FileMatcher();

  /**
   * Downloads a file from the given URL and returns its content.
   */
  protected download: (url: string) => Promise<string>;

  /**
   * Removes a file with the given filename from file storage.
   * In a hybrid app this would remove the file from the file system.
   * In a web app this would remove the file from the cache.
   */
  protected remove: (filename: string) => Promise<void>;

  /**
   * Saves the given data to a file with the given filename.
   * In a hybrid app this would save the file to the file system.
   * In a web app this would save the file to the cache.
   */
  protected save: (filename: string, data: string) => Promise<void>;

  /**
   * Lists all files in the file storage.
   * In a hybrid app this would list the files in the file system.
   * In a web app this would list the files in the cache.
   */
  protected list: () => Promise<string[]>;

  /**
   * Reports the progress of a file downloads.
   */
  protected progress: (progress: number) => void;

  constructor(
    download: (url: string) => Promise<string>,
    remove: (filename: string) => Promise<void>,
    save: (filename: string, data: string) => Promise<void>,
    list: () => Promise<string[]>,
    progress: (progress: number) => void
  ) {
    this.download = download;
    this.remove = remove;
    this.save = save;
    this.list = list;
    this.progress = progress;
  }

  async update(newFiles: File[]) {
    const oldFiles = await this.list();
    const matching = this.fileMatcher.match(oldFiles, newFiles.map(file => file.filename));
    const filesToDownload = newFiles.filter(file => matching.download.indexOf(file.filename) >= 0);
    await this.removeFiles(matching.remove);
    await this.downloadFiles(filesToDownload);
  }

  async removeFiles(filesToRemove: string[]) {
    for (let fileToRemove of filesToRemove) {
      await this.remove(fileToRemove);
    }
  }

  async downloadFiles(files: File[]) {
    for (let f = 0; f < files.length; f++) {
      const content = await this.download(files[f].externalUrl);
      await this.save(files[f].filename, content);
      this.progress(Math.trunc(((f + 1) / files.length) * 100));
    }
  }
}
