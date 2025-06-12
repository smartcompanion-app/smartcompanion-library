import { Asset, AssetRepository, LanguageRepository, PinRepository, ServerRepository, StationRepository, TextRepository, TourRepository } from "./data";
import { Storage } from "./storage";

export type RepositoryMap = {
  assets: AssetRepository;
  languages: LanguageRepository;
  pins: PinRepository;
  servers: ServerRepository;
  stations: StationRepository;
  texts: TextRepository;
  tours: TourRepository;
};

export class Repositories {

  protected storage: Storage;
  protected resolveUrl: (asset: Asset) => Promise<{ fileUrl: string, webUrl: string }>;
  protected repositories: Partial<RepositoryMap> = {};
  protected factories: { [K in keyof RepositoryMap]: () => RepositoryMap[K] };

  constructor(storage: Storage, resolveUrl: (asset: Asset) => Promise<{ fileUrl: string, webUrl: string }>) {
    this.storage = storage;
    this.resolveUrl = resolveUrl;
    this.factories = {
      assets: this.singleton('assets', () => new AssetRepository(this.storage, this.resolveUrl)),
      languages: this.singleton('languages', () => new LanguageRepository(this.storage)),
      pins: this.singleton('pins', () => new PinRepository(this.storage)),
      servers: this.singleton('servers', () => new ServerRepository(this.storage)),
      stations: this.singleton('stations', () => new StationRepository(this.storage, this.factories.assets())),
      texts: this.singleton('texts', () => new TextRepository(this.storage)),
      tours: this.singleton('tours', () => new TourRepository(this.storage, this.factories.assets(), this.factories.stations())),
    } as { [K in keyof RepositoryMap]: () => RepositoryMap[K] };
  }

  protected singleton<K extends keyof RepositoryMap>(name: K, factory: () => RepositoryMap[K]): () => RepositoryMap[K] {
    return () => {
      if (!this.repositories[name]) {
        this.repositories[name] = factory();
      }
      return this.repositories[name] as RepositoryMap[K];
    };
  }

  getRepository<K extends keyof RepositoryMap>(name: K): RepositoryMap[K] {
    const factory = this.factories[name];
    if (!factory) throw new Error(`Repository ${name} not found`);
    return factory();
  }
}
