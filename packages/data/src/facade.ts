import { FileUpdater } from "./file";
import {
  LoadUpdater,
  AssetRepository,
  LanguageRepository,
  TextRepository,
  StationRepository,
  PinRepository,
  TourRepository,
  Asset,
  Station,
  Language,
  Tour
} from "./data";
import { BrowserStorage, Storage } from "./storage";

export class DataFacade 
{
  protected storage: Storage;

  protected loadUpdater: LoadUpdater;
  protected fileUpdater: FileUpdater;

  protected assetRepository?: AssetRepository;
  protected languageRepository?: LanguageRepository;
  protected stationRepository?: StationRepository;
  protected textRepository?: TextRepository;
  protected pinRepository?: PinRepository;
  protected tourRepository?: TourRepository;

  protected downloadData: () => Promise<any>;
  protected downloadFile: (url: string) => Promise<any>;
  protected remove: (filename: string) => Promise<void>;
  protected save: (filename: string, data: any) => Promise<void>;
  protected list: () => Promise<string[]>;
  protected progress: ((progress: number) => void) | undefined;
  protected resolveUrl: (asset: Asset) => Promise<{ webUrl: string, fileUrl: string }>;

  constructor(
    downloadData: () => Promise<any>,
    downloadFile: (url: string) => Promise<string>,
    remove: (filename: string) => Promise<void>,
    save: (filename: string, data: string) => Promise<void>,
    list: () => Promise<string[]>,
    resolveUrl: (asset: Asset) => Promise<{ webUrl: string, fileUrl: string }>,
    storage: Storage = new BrowserStorage()
  ) {
    this.downloadData = downloadData;
    this.downloadFile = downloadFile;
    this.remove = remove;
    this.save = save;
    this.list = list;
    this.resolveUrl = resolveUrl;

    this.storage = storage;

    this.loadUpdater = new LoadUpdater(this.storage);
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
      this.loadUpdater.update(data);

      if (!this.getLanguageRepository().hasLanguage()) {
        return 'language';
      } else if (this.getPinRepository().isPinValidationRequired() && !this.getPinRepository().isValid()) {
        return 'pin';
      } else {
        const assets = this.getAssetRepository().getUnresolvedAssets({
          language: this.getLanguageRepository().getCurrentLanguage()
        });
        await this.fileUpdater.update(assets);
        this.storage.set('files-loaded', this.getLanguageRepository().getCurrentLanguage());

        return 'home';
      }
    } catch (e) {
      if (
        this.getLanguageRepository().hasLanguage() &&
        this.getPinRepository().isPinValidationRequired() && !this.getPinRepository().isValid()
      ) {
        return 'pin';
      } else if (
        this.getLanguageRepository().hasLanguage() &&
        this.storage.has('files-loaded') &&
        this.storage.get('files-loaded') == this.getLanguageRepository().getCurrentLanguage()
      ) {
        return 'home';
      } else {
        return 'error';
      }
    }
  }

  getLanguageRepository(): LanguageRepository {
    if (!this.languageRepository) {
      this.languageRepository = new LanguageRepository(this.storage);
    }
    return this.languageRepository;
  }

  getTextRepository(): TextRepository {
    if (!this.textRepository) {
      this.textRepository = new TextRepository(this.storage);
    }
    return this.textRepository;
  }

  getAssetRepository(): AssetRepository {
    if (!this.assetRepository) {
      this.assetRepository = new AssetRepository(this.storage, this.resolveUrl);
    }
    return this.assetRepository;
  }

  getStationRepository(): StationRepository {
    if (!this.stationRepository) {
      this.stationRepository = new StationRepository(this.storage, this.getAssetRepository());
    }
    return this.stationRepository;
  }

  getPinRepository(): PinRepository {
    if (!this.pinRepository) {
      this.pinRepository = new PinRepository(this.storage);
    }
    return this.pinRepository;
  }

  getTourRepository(): TourRepository {
    if (!this.tourRepository) {
      this.tourRepository = new TourRepository(this.storage, this.getAssetRepository(), this.getStationRepository());
    }
    return this.tourRepository;
  }

  hasLanguage(): boolean {
    return this.getLanguageRepository().hasLanguage();
  }

  changeLanguage(language: string) {
    this.getLanguageRepository().changeLanguage(language);
  }

  getCurrentLanguage(): string {
    return this.getLanguageRepository().getCurrentLanguage()
  }

  getLanguages(): Language[] {
    return this.getLanguageRepository().getLanguages();
  }

  getText(key: string): string {
    return this.getTextRepository().getText(key);
  }

  getStation(stationId: string): Promise<Station> {
    return this.getStationRepository().getStation(stationId)
  }

  getStations(): Promise<Station[]> {
    return this.getStationRepository().getStations();
  }

  getUnresolvedStations(): Station[] {
    return this.getStationRepository().getUnresolvedStations();
  }

  async getTourStations(tourId: string): Promise<Station[]> {
    if (tourId == "default") {
      const defaultTour = await this.getTourRepository().getDefaultTour();
      return this.getTourRepository().getStations(defaultTour.id);
    } else {
      return this.getTourRepository().getStations(tourId);
    }
  }

  getTours(): Promise<Tour[]> {
    return this.getTourRepository().getTours();
  }

  getTour(tourId: string): Promise<Tour> {
    return this.getTourRepository().getTour(tourId);
  }

  getDefaultTour(): Promise<Tour> {
    return this.getTourRepository().getDefaultTour();
  }

  async getTasks(tasks: string[]): Promise<Asset[]> {
    let result: Asset[] = [];
    for (const task of tasks) {
      const asset = await this.getAssetRepository().getAsset(task);
      result.push(asset);
    }
    return result;
  }

  async getTask(task: string): Promise<any> {
    const asset = await this.getAssetRepository().getAsset(task);
    const response = await fetch(asset.internalWebUrl);
    return await response.json();
  }

  isPinValid(): boolean {
    return this.getPinRepository().isValid();
  }

  validatePin(pin: string, hours: number = 6): boolean {
    return this.getPinRepository().validatePin(pin, hours);
  }

  updateCollectedPercentage(stationId: string, audioAssetId: string, collectedPercentage: number): Promise<Station> {
    return this.getStationRepository().updateCollectedPercentage(
      stationId,
      audioAssetId,
      collectedPercentage
    )
  }

  clearCollectionPercentage(language: string) {
    this.getStationRepository().clearCollectedPercentage(language);
  }
}
