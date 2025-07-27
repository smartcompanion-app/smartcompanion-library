import { describe, test, beforeEach, expect, jest } from '@jest/globals';
import { OfflineLoadService } from '../../src/load/offline-load-service';
import { MemoryStorage } from '../../src/storage';
import { ServiceLocator } from '../../src/service-locator';
import { Updater } from '../../src/update';
import { FileUpdater } from '../../src/file';

describe('offline load service', () => {
  let downloadDataFn: jest.Mock<() => Promise<any>>;
  let downloadFileFn: jest.Mock<(url: string) => Promise<string>>;
  let removeFn: jest.Mock<(filename: string) => Promise<void>>;
  let saveFn: jest.Mock<(filename: string, data: any) => Promise<void>>;
  let listFn: jest.Mock<() => Promise<string[]>>;
  let progressFn: jest.Mock;
  let memoryStorage: MemoryStorage;
  let serviceLocator: ServiceLocator;
  let dataUpdater: jest.Mocked<Updater>;
  let offlineLoadService: OfflineLoadService;

  beforeEach(() => {
    downloadDataFn = jest.fn();
    downloadFileFn = jest.fn();
    removeFn = jest.fn();
    saveFn = jest.fn();
    listFn = jest.fn();
    progressFn = jest.fn();
    memoryStorage = new MemoryStorage();

    // Mock Updater
    dataUpdater = {
      update: jest.fn(),
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
    jest.spyOn(serviceLocator.getPinService(), 'isPinValidationRequired').mockReturnValue(true);
    jest.spyOn(serviceLocator.getPinService(), 'isValid').mockReturnValue(false);

    const result = await offlineLoadService.load();
    expect(downloadDataFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual('pin');
  });
});
