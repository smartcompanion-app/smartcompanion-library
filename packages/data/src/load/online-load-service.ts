import { LanguageService, PinService } from '../domain/index.js';
import { Updater } from '../update/index.js';
import { LoadService } from './load-service.js';
import { autoSelectLanguage } from './utils.js';

/**
 * This load service strategy assumes a constant internet connection,
 * Assets like audio files and images are downloaded on demand.
 */
export class OnlineLoadService implements LoadService {
  protected languageService: LanguageService;
  protected pinService: PinService;
  protected dataUpdater: Updater;
  protected downloadData: () => Promise<unknown>;
  protected progress: (progress: number) => void = (_: number) => {};

  constructor(downloadData: () => Promise<unknown>, dataUpdater: Updater, languageService: LanguageService, pinService: PinService) {
    this.downloadData = downloadData;
    this.dataUpdater = dataUpdater;
    this.languageService = languageService;
    this.pinService = pinService;
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
        return 'home';
      }
    } catch (e) {
      console.error('Error loading data:', e);
      return 'error';
    }
  }

  /**
   * For the online load service, data is considered loaded
   * if a language is selected and PIN validation is not required or valid.
   */
  isLoaded(): boolean {
    return this.languageService.hasLanguage() && (!this.pinService.isPinValidationRequired() || this.pinService.isValid());
  }
}
