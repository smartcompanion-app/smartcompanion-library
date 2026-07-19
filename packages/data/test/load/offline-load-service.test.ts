import { describe, test, beforeEach, expect, vi, Mock, Mocked } from 'vitest';
import { OfflineLoadService } from '../../src/load/offline-load-service';
import { MemoryStorage } from '../../src/storage';
import { AssetService, Asset, LanguageService, PinService } from '../../src/domain';
import { Updater } from '../../src/update';

describe('offline load service', () => {
  let downloadDataFn: Mock<() => Promise<any>>;
  let downloadFileFn: Mock<(url: string) => Promise<string>>;
  let removeFn: Mock<(filename: string) => Promise<void>>;
  let saveFn: Mock<(filename: string, data: any) => Promise<void>>;
  let listFn: Mock<() => Promise<string[]>>;
  let progressFn: Mock;
  let memoryStorage: MemoryStorage;
  let languageService: LanguageService;
  let pinService: PinService;
  let assetService: AssetService;
  let dataUpdater: Mocked<Updater>;
  let offlineLoadService: OfflineLoadService;

  beforeEach(() => {
    downloadDataFn = vi.fn();
    downloadFileFn = vi.fn();
    removeFn = vi.fn();
    saveFn = vi.fn();
    listFn = vi.fn();
    progressFn = vi.fn();
    memoryStorage = new MemoryStorage();

    // Mock Updater
    dataUpdater = {
      update: vi.fn(),
    };
  });

  // Create services after each test has prepared the storage,
  // since LanguageService picks up a stored language in its constructor
  const createOfflineLoadService = () => {
    languageService = new LanguageService(memoryStorage);
    pinService = new PinService(memoryStorage);
    assetService = new AssetService(memoryStorage, async (asset: Asset) => ({ webUrl: asset.externalUrl, fileUrl: asset.externalUrl }));

    offlineLoadService = new OfflineLoadService(
      downloadDataFn,
      downloadFileFn,
      removeFn,
      saveFn,
      listFn,
      dataUpdater,
      memoryStorage,
      languageService,
      pinService,
      assetService
    );

    offlineLoadService.setProgressListener(progressFn);
  };

  test('should result in "error" when data download fails and memory is empty', async () => {
    createOfflineLoadService();
    downloadDataFn.mockImplementationOnce(() => { throw new Error("random error, whatever") });
    const result = await offlineLoadService.load();
    expect(downloadDataFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual('error');
  });

  test('should load data and return "language" if more than one language is available', async () => {
    createOfflineLoadService();
    downloadDataFn.mockResolvedValue({ example: 'data' });
    vi.spyOn(languageService, 'getLanguages').mockReturnValue([
      { language: 'en', title: 'English' }, { language: 'de', title: 'Deutsch' }
    ]);
    const result = await offlineLoadService.load();
    expect(result).toBe('language');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });

  test('should load data and return "home" if only one language is available', async () => {
    createOfflineLoadService();
    downloadDataFn.mockResolvedValue({ example: 'data' });
    listFn.mockResolvedValue([]);
    vi.spyOn(languageService, 'getLanguages').mockReturnValue([{ language: 'en', title: 'English' }]);
    vi.spyOn(assetService, 'getUnresolvedAssets').mockReturnValue([]);
    const result = await offlineLoadService.load();
    expect(result).toBe('home');
    expect(memoryStorage.get('language')).toBe('en');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });

  test('should result in "language" when data downloads and memory is empty', async () => {
    createOfflineLoadService();
    downloadDataFn.mockImplementationOnce(async () => ({ 'random': 'data', 'checksum': 'something' }));
    const result = await offlineLoadService.load();
    expect(downloadDataFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual('language');
  });

  test('should result in "home" when data download fails and data/files for language exists', async () => {
    memoryStorage.set('files-loaded', 'de');
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    createOfflineLoadService();

    downloadDataFn.mockImplementationOnce(() => { throw new Error("random error, whatever") });

    const result = await offlineLoadService.load();
    expect(downloadDataFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual('home');
  });

  test('should result in "pin" when language is set, pin is required and pin is invalid', async () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    memoryStorage.set('pins', ['1234']);
    createOfflineLoadService();
    downloadDataFn.mockImplementationOnce(async () => ({ 'random': 'data', 'checksum': 'something' }));

    // Mock pin service to require pin and be invalid
    vi.spyOn(pinService, 'isPinValidationRequired').mockReturnValue(true);
    vi.spyOn(pinService, 'isValid').mockReturnValue(false);

    const result = await offlineLoadService.load();
    expect(downloadDataFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual('pin');
  });

  test('isLoaded should return true when language is set, files are loaded and pin is not required', () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    memoryStorage.set('files-loaded', 'de');
    createOfflineLoadService();
    vi.spyOn(pinService, 'isPinValidationRequired').mockReturnValue(false);
    expect(offlineLoadService.isLoaded()).toBeTruthy();
  });

  test('isLoaded should return true when language is set, files are loaded and pin is valid', () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    memoryStorage.set('files-loaded', 'de');
    createOfflineLoadService();
    vi.spyOn(pinService, 'isPinValidationRequired').mockReturnValue(true);
    vi.spyOn(pinService, 'isValid').mockReturnValue(true);
    expect(offlineLoadService.isLoaded()).toBeTruthy();
  });

  test('isLoaded should return false when no language is set', () => {
    createOfflineLoadService();
    expect(offlineLoadService.isLoaded()).toBeFalsy();
  });

  test('isLoaded should return false when files are not loaded', () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    createOfflineLoadService();
    expect(offlineLoadService.isLoaded()).toBeFalsy();
  });

  test('isLoaded should return false when pin is required and not valid', () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    memoryStorage.set('files-loaded', 'de');
    createOfflineLoadService();
    vi.spyOn(pinService, 'isPinValidationRequired').mockReturnValue(true);
    vi.spyOn(pinService, 'isValid').mockReturnValue(false);
    expect(offlineLoadService.isLoaded()).toBeFalsy();
  });
});
