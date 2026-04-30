import { AssetService, LanguageService, PinService, ServerService, ShareService, StationService, TextService, TourService, Asset } from './domain';
import { LoadService } from './load';
import { Storage } from './storage';

/**
 * ServiceLocator is a central registry for services in the SmartCompanion app.
 */
export class ServiceLocator {
  protected servicesFactories = new Map<new (...args: unknown[]) => unknown, (serviceLocator: ServiceLocator) => unknown>();
  protected services = new Map<new (...args: unknown[]) => unknown, unknown>();
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  registerDefaultServices(
    resolveUrl: (asset: Asset) => Promise<{ fileUrl: string; webUrl: string }> = async (asset: Asset) => {
      return { webUrl: asset.externalUrl, fileUrl: asset.externalUrl };
    },
  ) {
    this.register(LanguageService, (serviceLocator: ServiceLocator) => new LanguageService(serviceLocator.storage));
    this.register(PinService, (serviceLocator: ServiceLocator) => new PinService(serviceLocator.storage));
    this.register(AssetService, (serviceLocator: ServiceLocator) => new AssetService(serviceLocator.storage, resolveUrl));
    this.register(ServerService, (serviceLocator: ServiceLocator) => new ServerService(serviceLocator.storage));
    this.register(ShareService, (serviceLocator: ServiceLocator) => new ShareService(serviceLocator.storage));
    this.register(TextService, (serviceLocator: ServiceLocator) => new TextService(serviceLocator.storage));
    this.register(StationService, (serviceLocator: ServiceLocator) => new StationService(serviceLocator.storage, serviceLocator.getAssetService()));
    this.register(TourService, (serviceLocator: ServiceLocator) => new TourService(serviceLocator.storage, serviceLocator.getAssetService(), serviceLocator.getStationService()));
  }

  register<T>(type: new (...args: unknown[]) => T, serviceFactory: (serviceLocator: ServiceLocator) => T) {
    this.servicesFactories.set(type, serviceFactory);
  }

  get<T>(type: new (...args: unknown[]) => T): T {
    if (!this.services.has(type)) {
      if (!this.servicesFactories.has(type)) {
        throw new Error(`Service of type ${type.name} is not registered.`);
      }
      const factory = this.servicesFactories.get(type)!;
      this.services.set(type, factory(this));
    }
    return this.services.get(type) as T;
  }

  getStorage(): Storage {
    return this.storage;
  }

  getLanguageService(): LanguageService {
    return this.get(LanguageService);
  }

  getPinService(): PinService {
    return this.get(PinService);
  }

  getAssetService(): AssetService {
    return this.get(AssetService);
  }

  getServerService(): ServerService {
    return this.get(ServerService);
  }

  getShareService(): ShareService {
    return this.get(ShareService);
  }

  getTextService(): TextService {
    return this.get(TextService);
  }

  getStationService(): StationService {
    return this.get(StationService);
  }

  getTourService(): TourService {
    return this.get(TourService);
  }

  getLoadService(): LoadService {
    return this.get(LoadService);
  }
}
