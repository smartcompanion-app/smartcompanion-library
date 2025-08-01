import { LanguageService, PinService } from "../domain";
import { ServiceLocator } from "../service-locator";
import { Updater } from "../update";
import { LoadService } from "./load-service";

/**
 * This load service strategy assumes a constant internet connection,
 * Assets like audio files and images are downloaded on demand.
 */
export class OnlineLoadService implements LoadService {
  
  protected languageService: LanguageService;
  protected pinService: PinService;
  protected dataUpdater: Updater;
  protected downloadData: () => Promise<any>;
  protected progress: ((progress: number) => void) = (_: number) => {}; 

  constructor(
    downloadData: () => Promise<any>,
    dataUpdater: Updater,
    serviceLocator: ServiceLocator
  ) {
    this.downloadData = downloadData;
    this.dataUpdater = dataUpdater;
    this.languageService = serviceLocator.getLanguageService();
    this.pinService = serviceLocator.getPinService();
  }

  setProgressListener(listener: (progress: number) => void) {
    this.progress = listener;
  }

  async load(): Promise<string> {
    try {
      const data = await this.downloadData();
      this.dataUpdater.update(data);

      if (!this.languageService.hasLanguage()) {
        return 'language';
      } else if (this.pinService.isPinValidationRequired() && !this.pinService.isValid()) {
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
