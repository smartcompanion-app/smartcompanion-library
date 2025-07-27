import { Asset } from "../domain";
import { FileUpdater } from "../file";
import { ServiceLocator } from "../service-locator";
import { BrowserStorage, Storage } from "../storage";
import { Updater } from "../update";

/**
 * This load service strategy is designed for offline use,
 * Assets like audio files and images are downloaded for offline use.
 */
export class OfflineLoadService {

  protected downloadData: () => Promise<any>;
  protected downloadFile: (url: string) => Promise<any>;
  protected remove: (filename: string) => Promise<void>;
  protected save: (filename: string, data: any) => Promise<void>;
  protected list: () => Promise<string[]>;
  protected progress: ((progress: number) => void) | undefined;
  protected dataUpdater: Updater;
  protected fileUpdater: FileUpdater;
  protected serviceLocator: ServiceLocator;

  constructor(
    downloadData: () => Promise<any>,
    downloadFile: (url: string) => Promise<string>,
    remove: (filename: string) => Promise<void>,
    save: (filename: string, data: string) => Promise<void>,
    list: () => Promise<string[]>,
    dataUpdater: Updater,
    serviceLocator: ServiceLocator
  ) {
    this.downloadData = downloadData;
    this.downloadFile = downloadFile;
    this.remove = remove;
    this.save = save;
    this.list = list;
    this.dataUpdater = dataUpdater;
    this.serviceLocator = serviceLocator;

    this.fileUpdater = new FileUpdater(
      this.downloadFile,
      this.remove,
      this.save,
      this.list,
      (progress: number) => {
        if (this.progress) this.progress(progress);
      }
    );
  }

  setProgressListener(listener: (progress: number) => void) {
    this.progress = listener;
  }

  async load(): Promise<string> {
    try {
      const data = await this.downloadData();
      this.dataUpdater.update(data);

      if (!this.serviceLocator.getLanguageService().hasLanguage()) {
        return 'language';
      } else if (
        this.serviceLocator.getPinService().isPinValidationRequired() && 
        !this.serviceLocator.getPinService().isValid()
      ) {
        return 'pin';
      } else {
        const assets = this.serviceLocator.getAssetService().getUnresolvedAssets({
          language: this.serviceLocator.getLanguageService().getCurrentLanguage()
        });
        await this.fileUpdater.update(assets);
        this.serviceLocator.getStorage().set(
          'files-loaded', 
          this.serviceLocator.getLanguageService().getCurrentLanguage()
        );

        return 'home';
      }
    } catch (e) {
      if (
        this.serviceLocator.getLanguageService().hasLanguage() &&
        this.serviceLocator.getPinService().isPinValidationRequired() &&
        !this.serviceLocator.getPinService().isValid()
      ) {
        return 'pin';
      } else if (
        this.serviceLocator.getLanguageService().hasLanguage() &&
        this.serviceLocator.getStorage().has('files-loaded') &&
        this.serviceLocator.getStorage().get('files-loaded') == this.serviceLocator.getLanguageService().getCurrentLanguage()
      ) {
        return 'home';
      } else {
        return 'error';
      }
    }
  }
}
