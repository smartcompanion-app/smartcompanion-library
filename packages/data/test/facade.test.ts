import { test, describe, beforeEach } from '@jest/globals';
import { SmartCompanion } from '../src/facade';
import { MemoryStorage } from '../src/storage';
import { getAsset } from './fixtures';

describe('smart companion facade', () => {

  let smartCompanion: SmartCompanion;
  let downloadDataFn: jest.Mock;
  let downloadFileFn: jest.Mock;
  let removeFn: jest.Mock;
  let saveFn: jest.Mock;
  let listFn: jest.Mock;
  let progressFn: jest.Mock;
  let resolveUrlFn: jest.Mock;
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    downloadDataFn = jest.fn();
    downloadFileFn = jest.fn();
    removeFn = jest.fn();
    saveFn = jest.fn();
    listFn = jest.fn();
    progressFn = jest.fn();
    resolveUrlFn = jest.fn();
    memoryStorage = new MemoryStorage();

    smartCompanion = new SmartCompanion(
      downloadDataFn,
      downloadFileFn,
      removeFn,
      saveFn,
      listFn,
      resolveUrlFn,
      memoryStorage
    );

    smartCompanion.setProgressListener(progressFn);
  });

  test('should result in "error" when data download fails and memory is empty', async () => {
    downloadDataFn.mockImplementationOnce(() => { throw new Error("random error, whatever") });
    const result = await smartCompanion.load();
    expect(downloadDataFn.mock.calls.length).toEqual(1);
    expect(result).toEqual('error');
  });

  test('should result in "language" when data downloads and memory is empty', async () => {
    downloadDataFn.mockImplementationOnce(() => { return { 'random': 'data', 'checksum': 'something' } });
    const result = await smartCompanion.load();
    expect(downloadDataFn.mock.calls.length).toEqual(1);
    expect(result).toEqual('language');
  });

  test('should result in "home" when data download fails and data/files for language exists', async () => {
    memoryStorage.set('files-loaded', 'de');
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');

    downloadDataFn.mockImplementationOnce(() => { throw new Error("random error, whatever") });

    const result = await smartCompanion.load();
    expect(downloadDataFn.mock.calls.length).toEqual(1);
    expect(result).toEqual('home');
  });

  test('should result in "pin" when language is set, pin is required and pin is invalid', async () => {
    memoryStorage.set('languages', [{ title: "Deutsch", language: "de" }]);
    memoryStorage.set('language', 'de');
    memoryStorage.set('pins', ['1234']);
    downloadDataFn.mockImplementationOnce(() => { return { 'random': 'data', 'checksum': 'something' } });

    const result = await smartCompanion.load();
    expect(downloadDataFn.mock.calls.length).toEqual(1);
    expect(result).toEqual('pin');
  });

  test('should result in "home" when all data/files are downloaded', async () => {
    memoryStorage.set('checksum', 'old');
    memoryStorage.set('language', 'de');

    const asset1 = getAsset();
    const asset2 = getAsset();
    const asset3 = getAsset('de');
    const asset4 = getAsset('en');

    downloadDataFn.mockImplementationOnce(() => {
      return {
        'checksum': 'new',
        'texts': [],
        'stations': [],
        'languages': [
          { title: "English", language: "en" },
          { title: "Deutsch", language: "de" }
        ],
        'assets': [
          asset1,
          asset2,
          asset3,
          asset4
        ]
      };
    });

    listFn.mockReturnValueOnce(['abc.png']);
    downloadFileFn.mockReturnValue('xyz');

    const result = await smartCompanion.load();

    expect(downloadDataFn.mock.calls.length).toEqual(1);
    expect(listFn.mock.calls.length).toEqual(1);
    expect(resolveUrlFn.mock.calls.length).toEqual(0);

    // file removals
    expect(removeFn.mock.calls.length).toEqual(1);
    expect(removeFn.mock.calls[0][0]).toEqual('abc.png');

    // file downloads
    expect(downloadFileFn.mock.calls.length).toEqual(3);
    expect(downloadFileFn.mock.calls[0][0]).toEqual(asset1.externalUrl);
    expect(downloadFileFn.mock.calls[1][0]).toEqual(asset2.externalUrl);
    expect(downloadFileFn.mock.calls[2][0]).toEqual(asset3.externalUrl);

    expect(memoryStorage.get('files-loaded')).toEqual("de"); // side-effect
    expect(result).toEqual('home');
  });
});
