import { describe, test, beforeEach, expect, vi, Mock, Mocked } from 'vitest';
import { OfflineLoadService } from '../../src/load/offline-load-service';
import { MemoryStorage } from '../../src/storage';
import { ServiceLocator } from '../../src/service-locator';
import { Updater } from '../../src/update';

describe('offline load service', () => {
  let downloadDataFn: Mock<() => Promise<any>>;
  let downloadFileFn: Mock<(url: string) => Promise<string>>;
  let removeFn: Mock<(filename: string) => Promise<void>>;
  let saveFn: Mock<(filename: string, data: any) => Promise<void>>;
  let listFn: Mock<() => Promise<string[]>>;
  let progressFn: Mock;
  let memoryStorage: MemoryStorage;
  let serviceLocator: ServiceLocator;
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

    // ServiceLocator needs to be constructed with storage
    serviceLocator = new ServiceLocator(memoryStorage);
    serviceLocator.registerDefaultServices();

    offlineLoadService = new OfflineLoadService(
      downloadDataFn,
      downloadFileFn,
      removeFn,
      saveFn,
      listFn,
      dataUpdater,
      serviceLocator
    );

    offlineLoadService.setProgressListener(progressFn);
  });

  test('should result in "error" when data download fails and memory is empty', async () => {
    downloadDataFn.mockImplementationOnce(() => { throw new Error("random error, whatever") });
    const result = await offlineLoadService.load();
    expect(downloadDataFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual('error');
  });

  test('should load data and return "language" if more than one language is available', async () => {
    downloadDataFn.mockResolvedValue({ example: 'data' });
    vi.spyOn(serviceLocator.getLanguageService(), 'getLanguages').mockReturnValue([
      { language: 'en', title: 'English' }, { language: 'de', title: 'Deutsch' }
    ]);
    const result = await offlineLoadService.load();
    expect(result).toBe('language');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });

  test('should load data and return "home" if only one language is available', async () => {
    downloadDataFn.mockResolvedValue({ example: 'data' });
    listFn.mockResolvedValue([]);
    vi.spyOn(serviceLocator.getLanguageService(), 'getLanguages').mockReturnValue([{ language: 'en', title: 'English' }]);
    vi.spyOn(serviceLocator.getAssetService(), 'getUnresolvedAssets').mockReturnValue([]);
    const result = await offlineLoadService.load();
    expect(result).toBe('home');
    expect(memoryStorage.get('language')).toBe('en');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });

  test('should result in "language" when data downloads and memory is empty', async () => {
    downloadDataFn.mockImplementationOnce(async () => ({ 'random': 'data', 'checksum': 'something' }));
    const result = await offlineLoadService.load();
    expect(downloadDataFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual('language');
  });

  test('should result in "home" when data download fails and data/files for language exists', async () => {
    memoryStorage.set('files-loaded', 'de');
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');

    downloadDataFn.mockImplementationOnce(() => { throw new Error("random error, whatever") });

    const result = await offlineLoadService.load();
    expect(downloadDataFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual('home');
  });

  test('should result in "pin" when language is set, pin is required and pin is invalid', async () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    memoryStorage.set('pins', ['1234']);
    downloadDataFn.mockImplementationOnce(async () => ({ 'random': 'data', 'checksum': 'something' }));

    // Mock pin service to require pin and be invalid
    vi.spyOn(serviceLocator.getPinService(), 'isPinValidationRequired').mockReturnValue(true);
    vi.spyOn(serviceLocator.getPinService(), 'isValid').mockReturnValue(false);

    const result = await offlineLoadService.load();
    expect(downloadDataFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual('pin');
  });

  test('isLoaded should return true when language is set, files are loaded and pin is not required', () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    memoryStorage.set('files-loaded', 'de');
    vi.spyOn(serviceLocator.getPinService(), 'isPinValidationRequired').mockReturnValue(false);
    expect(offlineLoadService.isLoaded()).toBeTruthy();
  });

  test('isLoaded should return true when language is set, files are loaded and pin is valid', () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    memoryStorage.set('files-loaded', 'de');
    vi.spyOn(serviceLocator.getPinService(), 'isPinValidationRequired').mockReturnValue(true);
    vi.spyOn(serviceLocator.getPinService(), 'isValid').mockReturnValue(true);
    expect(offlineLoadService.isLoaded()).toBeTruthy();
  });

  test('isLoaded should return false when no language is set', () => {
    expect(offlineLoadService.isLoaded()).toBeFalsy();
  });

  test('isLoaded should return false when files are not loaded', () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    expect(offlineLoadService.isLoaded()).toBeFalsy();
  });

  test('isLoaded should return false when pin is required and not valid', () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    memoryStorage.set('files-loaded', 'de');
    vi.spyOn(serviceLocator.getPinService(), 'isPinValidationRequired').mockReturnValue(true);
    vi.spyOn(serviceLocator.getPinService(), 'isValid').mockReturnValue(false);
    expect(offlineLoadService.isLoaded()).toBeFalsy();
  });
});
