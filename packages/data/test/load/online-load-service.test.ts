import { test, describe, beforeEach } from '@jest/globals';
import { OnlineLoadService } from '../../src/load';
import { MemoryStorage, Storage } from '../../src/storage';
import { ServiceLocator } from '../../src/service-locator';

describe('online load service', () => {

  let loadService: OnlineLoadService;
  let downloadDataFn: jest.Mock;  
  let progressFn: jest.Mock;
  let dataUpdater: { update: jest.Mock };
  let serviceLocator: ServiceLocator;
  let storage: Storage;
  
  beforeEach(() => {
    downloadDataFn = jest.fn();    
    progressFn = jest.fn();
    dataUpdater = { update: jest.fn() };
    storage = new MemoryStorage();
    serviceLocator = new ServiceLocator(storage);
    serviceLocator.registerDefaultServices();

    loadService = new OnlineLoadService(
      downloadDataFn,
      dataUpdater,
      serviceLocator
    );

    loadService.setProgressListener(progressFn);
  });

  test('should load data and return "home" if only one language is available', async () => {
    downloadDataFn.mockResolvedValue({ example: 'data' });
    jest.spyOn(serviceLocator.getLanguageService(), 'getLanguages').mockReturnValue([{ language: 'en', title: 'English' }]);
    const result = await loadService.load();
    expect(result).toBe('home');
    expect(storage.get('language')).toBe('en');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });

  test('should load data and return "language" if more than one language is available', async () => {
    downloadDataFn.mockResolvedValue({ example: 'data' });
    jest.spyOn(serviceLocator.getLanguageService(), 'getLanguages').mockReturnValue([
      { language: 'en', title: 'English' }, { language: 'de', title: 'Deutsch' }
    ]);
    const result = await loadService.load();
    expect(result).toBe('language');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });

  test('should load data and return "language" if no language is set', async () => {
    downloadDataFn.mockResolvedValue({ example: 'data' });
    const result = await loadService.load();
    expect(result).toBe('language');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });

  test('should load data and return "home" if no pin is required', async () => {
    downloadDataFn.mockResolvedValue({ example: 'data' });
    jest.spyOn(serviceLocator.getLanguageService(), 'hasLanguage').mockReturnValue(true);
    const result = await loadService.load();
    expect(result).toBe('home');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });

  test('should load data and return "pin" if pin is required', async () => {
    downloadDataFn.mockResolvedValue({ example: 'data' });
    jest.spyOn(serviceLocator.getLanguageService(), 'hasLanguage').mockReturnValue(true);
    jest.spyOn(serviceLocator.getPinService(), 'isPinValidationRequired').mockReturnValue(true);
    jest.spyOn(serviceLocator.getPinService(), 'isValid').mockReturnValue(false);
    const result = await loadService.load();
    expect(result).toBe('pin');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });


  test('should return "error" when error is thrown from download', async () => {    
    downloadDataFn.mockRejectedValue(new Error('Network error'));    
    const result = await loadService.load();
    expect(result).toBe('error');
  });

  test('isLoaded should return true when language is set and pin is not required', () => {
    jest.spyOn(serviceLocator.getLanguageService(), 'hasLanguage').mockReturnValue(true);
    jest.spyOn(serviceLocator.getPinService(), 'isPinValidationRequired').mockReturnValue(false);
    expect(loadService.isLoaded()).toBeTruthy();
  });

  test('isLoaded should return true when language is set and pin is valid', () => {
    jest.spyOn(serviceLocator.getLanguageService(), 'hasLanguage').mockReturnValue(true);
    jest.spyOn(serviceLocator.getPinService(), 'isPinValidationRequired').mockReturnValue(true);
    jest.spyOn(serviceLocator.getPinService(), 'isValid').mockReturnValue(true);
    expect(loadService.isLoaded()).toBeTruthy();
  });

  test('isLoaded should return false when no language is set', () => {
    jest.spyOn(serviceLocator.getLanguageService(), 'hasLanguage').mockReturnValue(false);
    expect(loadService.isLoaded()).toBeFalsy();
  });

  test('isLoaded should return false when pin is required and not valid', () => {
    jest.spyOn(serviceLocator.getLanguageService(), 'hasLanguage').mockReturnValue(true);
    jest.spyOn(serviceLocator.getPinService(), 'isPinValidationRequired').mockReturnValue(true);
    jest.spyOn(serviceLocator.getPinService(), 'isValid').mockReturnValue(false);
    expect(loadService.isLoaded()).toBeFalsy();
  });
});
