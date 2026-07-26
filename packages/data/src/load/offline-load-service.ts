import { AssetService, LanguageService, PinService } from '../domain/index.js';
import { FileUpdater } from '../file/index.js';
import { Storage } from '../storage/index.js';
import { Updater } from '../update/index.js';
import { LoadService } from './load-service.js';
import { autoSelectLanguage } from './utils.js';

/**
 * This load service strategy is designed for offline use,
 * Assets like audio files and images are downloaded for offline use.
 */
export class OfflineLoadService implements LoadService {
  protected downloadData: () => Promise<unknown>;
  protected downloadFile: (url: string) => Promise<string>;
  protected remove: (filename: string) => Promise<void>;
  protected save: (filename: string, data: string) => Promise<void>;
  protected list: () => Promise<string[]>;
  protected progress: ((progress: number) => void) | undefined;
  protected dataUpdater: Updater;
  protected fileUpdater: FileUpdater;
  protected storage: Storage;
  protected languageService: LanguageService;
  protected pinService: PinService;
  protected assetService: AssetService;

  constructor(
    downloadData: () => Promise<unknown>,
    downloadFile: (url: string) => Promise<string>,
    remove: (filename: string) => Promise<void>,
    save: (filename: string, data: string) => Promise<void>,
    list: () => Promise<string[]>,
    dataUpdater: Updater,
    storage: Storage,
    languageService: LanguageService,
    pinService: PinService,
    assetService: AssetService,
  ) {
    this.downloadData = downloadData;
    this.downloadFile = downloadFile;
    this.remove = remove;
    this.save = save;
    this.list = list;
    this.dataUpdater = dataUpdater;
    this.storage = storage;
    this.languageService = languageService;
    this.pinService = pinService;
    this.assetService = assetService;

    this.fileUpdater = new FileUpdater(this.downloadFile, this.remove, this.save, this.list, (progress: number) => {
      if (this.progress) this.progress(progress);
    });
  }

  setProgressListener(listener: (progress: number) => void) {
    this.progress = listener;
  }

  async load(): Promise<string> {
    try {
      const data = await this.downloadData();
      this.dataUpdater.update(data);
      autoSelectLanguage(this.languageService);

      if (!this.languageService.hasLanguage()) {
        return 'language';
      } else if (this.pinService.isPinValidationRequired() && !this.pinService.isValid()) {
        return 'pin';
      } else {
        const assets = this.assetService.getUnresolvedAssets({
          language: this.languageService.getCurrentLanguage(),
        });
        await this.fileUpdater.update(assets);
        this.storage.set('files-loaded', this.languageService.getCurrentLanguage());

        return 'home';
      }
    } catch (e) {
      console.error('error loading data', e);

      if (this.languageService.hasLanguage() && this.pinService.isPinValidationRequired() && !this.pinService.isValid()) {
        return 'pin';
      } else if (this.isLoaded()) {
        return 'home';
      } else {
        return 'error';
      }
    }
  }

  /**
   * For the offline load service, data is considered loaded
   * if a language is selected, files are loaded and PIN validation is not required or valid.
   */
  isLoaded(): boolean {
    return (
      this.languageService.hasLanguage() &&
      this.storage.has('files-loaded') &&
      this.storage.get('files-loaded') == this.languageService.getCurrentLanguage() &&
      (!this.pinService.isPinValidationRequired() || this.pinService.isValid())
    );
  }
}
