import { LanguageRepository, PinRepository } from "../data";
import { BrowserStorage, Storage } from "../storage";
import { Updater } from "../update";
import { LoadService } from "./load-service";

/**
 * This load service strategy assumes a constant internet connection,
 * Assets like audio files and images are downloaded on demand.
 */
export class OnlineLoadService implements LoadService {
  
  protected languageRepository: LanguageRepository;
  protected pinRepository: PinRepository;
  protected storage: Storage;
  protected dataUpdater: Updater;
  protected downloadData: () => Promise<any>;
  protected progress: ((progress: number) => void) | undefined; 

  constructor(
    downloadData: () => Promise<any>,
    dataUpdater: Updater,
    storage: Storage = new BrowserStorage()
  ) {
    this.downloadData = downloadData;
    this.dataUpdater = dataUpdater;
    this.storage = storage;
    this.languageRepository = new LanguageRepository(this.storage);
    this.pinRepository = new PinRepository(this.storage);
  }

  setProgressListener(listener: (progress: number) => void) {
    this.progress = listener;
  }

  async load(): Promise<string> {
    try {
      const data = await this.downloadData();
      this.dataUpdater.update(data);

      if (this.languageRepository.hasLanguage()) {
        return 'language';
      } else if (this.pinRepository.isPinValidationRequired() && !this.pinRepository.isValid()) {
        return 'pin';
      } else {
        return 'home';
      }
    } catch (e) {
      console.error('Error loading data:', e);
      return 'error';
    }
  }
}