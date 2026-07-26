import {
  Asset,
  AssetService,
  BrowserStorage,
  DataUpdater,
  Language,
  LanguageService,
  LoadService,
  OfflineLoadService,
  OnlineLoadService,
  PinService,
  ServerService,
  ShareService,
  StationService,
  Storage,
  TextService,
  TourService,
} from '@smartcompanion/data';
import { RoutingService, MenuService, AudioPlayerService, CollectibleAudioPlayerService } from './services';

type ResolveUrl = (asset: Asset) => Promise<{ fileUrl: string; webUrl: string }>;

/**
 * ServiceFacade is the composition root for SmartCompanion apps:
 * it wires up and provides all data and platform services as lazy singletons.
 */
export class ServiceFacade {
  protected storage: Storage;
  protected resolveUrl: ResolveUrl;

  protected languageService?: LanguageService;
  protected pinService?: PinService;
  protected assetService?: AssetService;
  protected serverService?: ServerService;
  protected shareService?: ShareService;
  protected textService?: TextService;
  protected stationService?: StationService;
  protected tourService?: TourService;
  protected routingService?: RoutingService;
  protected menuService?: MenuService;

  protected audioPlayerFactory?: () => AudioPlayerService;
  protected audioPlayerService?: AudioPlayerService;
  protected loadServiceFactory?: () => LoadService;
  protected loadService?: LoadService;

  constructor(
    storage: Storage = new BrowserStorage(),
    resolveUrl: ResolveUrl = async (asset: Asset) => {
      return { webUrl: asset.externalUrl, fileUrl: asset.externalUrl };
    },
  ) {
    this.storage = storage;
    this.resolveUrl = resolveUrl;
  }

  registerDefaultAudioPlayerService(subtitle: string): void {
    this.audioPlayerFactory = () => new AudioPlayerService(subtitle);
  }

  registerCollectibleAudioPlayerService(subtitle: string): void {
    this.audioPlayerFactory = () => new CollectibleAudioPlayerService(subtitle);
  }

  registerOnlineLoadService(downloadData: () => Promise<unknown>): void {
    this.loadServiceFactory = () => new OnlineLoadService(downloadData, new DataUpdater(this.storage), this.getLanguageService(), this.getPinService());
  }

  registerOfflineLoadService(
    downloadData: () => Promise<unknown>,
    downloadFile: (url: string) => Promise<string>,
    remove: (filename: string) => Promise<void>,
    save: (filename: string, data: string) => Promise<void>,
    list: () => Promise<string[]>,
  ): void {
    this.loadServiceFactory = () =>
      new OfflineLoadService(
        downloadData,
        downloadFile,
        remove,
        save,
        list,
        new DataUpdater(this.storage),
        this.storage,
        this.getLanguageService(),
        this.getPinService(),
        this.getAssetService(),
      );
  }

  getStorage(): Storage {
    return this.storage;
  }

  getLanguageService(): LanguageService {
    return (this.languageService ??= new LanguageService(this.storage));
  }

  getPinService(): PinService {
    return (this.pinService ??= new PinService(this.storage));
  }

  getAssetService(): AssetService {
    return (this.assetService ??= new AssetService(this.storage, this.resolveUrl));
  }

  getServerService(): ServerService {
    return (this.serverService ??= new ServerService(this.storage));
  }

  getShareService(): ShareService {
    return (this.shareService ??= new ShareService(this.storage));
  }

  getTextService(): TextService {
    return (this.textService ??= new TextService(this.storage));
  }

  getStationService(): StationService {
    return (this.stationService ??= new StationService(this.storage, this.getAssetService()));
  }

  getTourService(): TourService {
    return (this.tourService ??= new TourService(this.storage, this.getAssetService(), this.getStationService()));
  }

  getRoutingService(): RoutingService {
    return (this.routingService ??= new RoutingService());
  }

  getMenuService(): MenuService {
    return (this.menuService ??= new MenuService());
  }

  getAudioPlayerService(): AudioPlayerService {
    if (!this.audioPlayerService) {
      if (!this.audioPlayerFactory) {
        throw new Error('No audio player service registered, call registerDefaultAudioPlayerService() or registerCollectibleAudioPlayerService() first.');
      }
      this.audioPlayerService = this.audioPlayerFactory();
    }
    return this.audioPlayerService;
  }

  getLoadService(): LoadService {
    if (!this.loadService) {
      if (!this.loadServiceFactory) {
        throw new Error('No load service registered, call registerOnlineLoadService() or registerOfflineLoadService() first.');
      }
      this.loadService = this.loadServiceFactory();
    }
    return this.loadService;
  }

  changeLanguage(language: string): void {
    this.getLanguageService().changeLanguage(language);
  }

  getLanguages(): Language[] {
    return this.getLanguageService().getLanguages();
  }

  /**
   * Get a translation for a specific key.
   */
  __(key: string): string {
    if (this.getLanguageService().hasLanguage()) {
      return this.getTextService().getText(key);
    } else {
      return key; // Fallback to key if no language is set
    }
  }

  /**
   * Default route guard to ensure data is loaded.
   */
  canLoadRoute(): boolean | { redirect: string } {
    if (this.getLoadService().isLoaded()) {
      return true;
    } else {
      const hash = globalThis?.location?.hash;
      if (hash && hash.startsWith('#/')) {
        this.storage.set('pending-route', hash.substring(1));
      }
      return { redirect: '/' };
    }
  }

  /**
   * Get and clear any stored pending route or null if none exists.
   */
  getPendingRoute(): string | null {
    if (this.storage.has('pending-route')) {
      const route = this.storage.get('pending-route') as string;
      this.storage.unset('pending-route');
      return route;
    }
    return null;
  }
}
