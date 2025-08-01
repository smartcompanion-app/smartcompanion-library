import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage, Storage } from '../../../src/storage';
import { AssetService } from '../../../src/domain';
import { setAssetToStorage, setAssetWithoutLanguageToStorage } from '../../fixtures';

describe('test asset service', () => {

  let memoryStorage: Storage;
  let service: AssetService;
  let resolveUrl: jest.Mock;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    resolveUrl = jest.fn();
    service = new AssetService(memoryStorage, resolveUrl);
  });

  test('should load an asset and resolve external to internal url', async () => {
    const expectedAsset = setAssetToStorage(memoryStorage);
    resolveUrl.mockReturnValueOnce({
      fileUrl: 'file://internal.url',
      webUrl: 'http://internal.url'
    });

    const asset = await service.getAsset(expectedAsset.id);
    expectedAsset.internalWebUrl = 'http://internal.url';
    expectedAsset.internalFileUrl = 'file://internal.url';

    expect(asset).toEqual(expectedAsset);
    expect(resolveUrl.mock.calls.length).toEqual(1);
    expect(resolveUrl.mock.calls[0][0].id).toEqual(expectedAsset.id);
  });

  test('should load assets with language and without language and should resolve external to internal url', async () => {
    setAssetWithoutLanguageToStorage(memoryStorage);
    setAssetToStorage(memoryStorage, 'de');
    setAssetToStorage(memoryStorage, 'de');

    resolveUrl.mockReturnValue('http://internal.url');

    const assets = await service.getAssets({
      language: 'de'
    });

    expect(assets.length).toEqual(3);
    expect(resolveUrl.mock.calls.length).toEqual(3);
  });


  test('should load assets with language only and resolve external to internal url', async () => {
    setAssetWithoutLanguageToStorage(memoryStorage);
    setAssetWithoutLanguageToStorage(memoryStorage);
    setAssetToStorage(memoryStorage, 'de');
    setAssetToStorage(memoryStorage, 'de');

    resolveUrl
      .mockReturnValue('http://internal.url');

    const assets = await service.getAssets({
      language: 'de',
      excludeNoLanguage: true
    });

    expect(assets.length).toEqual(2);
    expect(resolveUrl.mock.calls.length).toEqual(2);
  });


  test('should load no assets as missing language filter and excludeNoLanguage is given', async () => {
    setAssetWithoutLanguageToStorage(memoryStorage);
    setAssetWithoutLanguageToStorage(memoryStorage);
    setAssetToStorage(memoryStorage, 'de');
    setAssetToStorage(memoryStorage, 'en');

    resolveUrl
      .mockReturnValue('http://internal.url');

    const assets = await service.getAssets({
      excludeNoLanguage: true
    });

    expect(assets.length).toEqual(0);
    expect(resolveUrl.mock.calls.length).toEqual(0);
  });

  test('should load assets without language only and resolve external to internal url', async () => {
    setAssetWithoutLanguageToStorage(memoryStorage);
    setAssetWithoutLanguageToStorage(memoryStorage);
    setAssetToStorage(memoryStorage, 'de');
    setAssetToStorage(memoryStorage, 'en');

    resolveUrl
      .mockReturnValue('http://internal.url');

    const assets = await service.getAssets();

    expect(assets.length).toEqual(2);
    expect(resolveUrl.mock.calls.length).toEqual(2);
  });

  test('should load assets with language and without language and should not resolve external to internal url', () => {
    setAssetWithoutLanguageToStorage(memoryStorage);
    setAssetWithoutLanguageToStorage(memoryStorage);
    setAssetToStorage(memoryStorage, 'de');
    setAssetToStorage(memoryStorage, 'en');

    resolveUrl
      .mockReturnValue('http://internal.url');

    const assets = service.getUnresolvedAssets({ language: 'de' });

    expect(assets.length).toEqual(3);
    expect(resolveUrl.mock.calls.length).toEqual(0);
  });
});
