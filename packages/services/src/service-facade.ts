import { LoadService, Language, ServiceLocator, Storage, BrowserStorage, OnlineLoadService, DataUpdater, OfflineLoadService, Asset } from '@smartcompanion/data';
import { RoutingService, MenuService, AudioPlayerService, CollectibleAudioPlayerService } from './services';

export class ServiceFacade extends ServiceLocator {

  constructor(storage: Storage = new BrowserStorage()) {
    super(storage);
  }

  registerDefaultServices(
    resolveUrl: (asset: Asset) => Promise<{ fileUrl: string, webUrl: string }> =
      async (asset: Asset) => {
        return { webUrl: asset.externalUrl, fileUrl: asset.externalUrl };
      }
  ) {
    super.registerDefaultServices(resolveUrl);
    this.register(RoutingService, (_: ServiceLocator) => new RoutingService());
    this.register(MenuService, (_: ServiceLocator) => new MenuService());
  }

  registerDefaultAudioPlayerService(subtitle: string): void {
    this.register(AudioPlayerService, (_: ServiceLocator) => new AudioPlayerService(subtitle));
  }

  registerCollectibleAudioPlayerService(subtitle: string): void {
    this.register(AudioPlayerService, (_: ServiceLocator) => new CollectibleAudioPlayerService(subtitle));
  }

  registerOnlineLoadService(downloadData: () => Promise<any>): void {
    this.register(LoadService, (serviceLocator: ServiceLocator) => new OnlineLoadService(
      downloadData,
      new DataUpdater(serviceLocator.getStorage()),
      serviceLocator
    ));
  }

  registerOfflineLoadService(
    downloadData: () => Promise<any>,
    downloadFile: (url: string) => Promise<string>,
    remove: (filename: string) => Promise<void>,
    save: (filename: string, data: string) => Promise<void>,
    list: () => Promise<string[]>
  ): void {
    this.register(LoadService, (serviceLocator: ServiceLocator) => new OfflineLoadService(
      downloadData,
      downloadFile,
      remove,
      save,
      list,
      new DataUpdater(serviceLocator.getStorage()),
      serviceLocator
    ));
  }

  getRoutingService(): RoutingService {
    return this.get(RoutingService);
  }

  getMenuService(): MenuService {
    return this.get(MenuService);
  }

  getAudioPlayerService(): AudioPlayerService {
    return this.get(AudioPlayerService);
  }

  changeLanguage(language: string): void {
    this.getLanguageService().changeLanguage(language);
  }

  getLanguages(): Language[] {
    return this.getLanguageService().getLanguages();
  }

  __(key: string): string {
    if (this.getLanguageService().hasLanguage()) {
      return this.getTextService().getText(key);
    } else {
      return key; // Fallback to key if no language is set
    }
  }
}
