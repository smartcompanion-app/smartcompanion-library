import { test, describe, beforeEach, expect, vi, Mock } from 'vitest';
import { OnlineLoadService } from '../../src/load';
import { MemoryStorage, Storage } from '../../src/storage';
import { LanguageService, PinService } from '../../src/domain';

describe('online load service', () => {

  let loadService: OnlineLoadService;
  let downloadDataFn: Mock;
  let progressFn: Mock;
  let dataUpdater: { update: Mock };
  let languageService: LanguageService;
  let pinService: PinService;
  let storage: Storage;

  beforeEach(() => {
    downloadDataFn = vi.fn();
    progressFn = vi.fn();
    dataUpdater = { update: vi.fn() };
    storage = new MemoryStorage();
    languageService = new LanguageService(storage);
    pinService = new PinService(storage);

    loadService = new OnlineLoadService(
      downloadDataFn,
      dataUpdater,
      languageService,
      pinService
    );

    loadService.setProgressListener(progressFn);
  });

  test('should load data and return "home" if only one language is available', async () => {
    downloadDataFn.mockResolvedValue({ example: 'data' });
    vi.spyOn(languageService, 'getLanguages').mockReturnValue([{ language: 'en', title: 'English' }]);
    const result = await loadService.load();
    expect(result).toBe('home');
    expect(storage.get('language')).toBe('en');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });

  test('should load data and return "language" if more than one language is available', async () => {
    downloadDataFn.mockResolvedValue({ example: 'data' });
    vi.spyOn(languageService, 'getLanguages').mockReturnValue([
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
    vi.spyOn(languageService, 'hasLanguage').mockReturnValue(true);
    const result = await loadService.load();
    expect(result).toBe('home');
    expect(dataUpdater.update).toHaveBeenCalledWith({ example: 'data' });
  });

  test('should load data and return "pin" if pin is required', async () => {
    downloadDataFn.mockResolvedValue({ example: 'data' });
    vi.spyOn(languageService, 'hasLanguage').mockReturnValue(true);
    vi.spyOn(pinService, 'isPinValidationRequired').mockReturnValue(true);
    vi.spyOn(pinService, 'isValid').mockReturnValue(false);
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
    vi.spyOn(languageService, 'hasLanguage').mockReturnValue(true);
    vi.spyOn(pinService, 'isPinValidationRequired').mockReturnValue(false);
    expect(loadService.isLoaded()).toBeTruthy();
  });

  test('isLoaded should return true when language is set and pin is valid', () => {
    vi.spyOn(languageService, 'hasLanguage').mockReturnValue(true);
    vi.spyOn(pinService, 'isPinValidationRequired').mockReturnValue(true);
    vi.spyOn(pinService, 'isValid').mockReturnValue(true);
    expect(loadService.isLoaded()).toBeTruthy();
  });

  test('isLoaded should return false when no language is set', () => {
    vi.spyOn(languageService, 'hasLanguage').mockReturnValue(false);
    expect(loadService.isLoaded()).toBeFalsy();
  });

  test('isLoaded should return false when pin is required and not valid', () => {
    vi.spyOn(languageService, 'hasLanguage').mockReturnValue(true);
    vi.spyOn(pinService, 'isPinValidationRequired').mockReturnValue(true);
    vi.spyOn(pinService, 'isValid').mockReturnValue(false);
    expect(loadService.isLoaded()).toBeFalsy();
  });
});
