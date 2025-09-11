import { Storage } from "../../storage";
import { Asset } from ".";

/**
 * Repository to retrieve assets.
 * 
 * In the context of hybrid apps, assets can be stored in the local filesystem.
 * Further they can be consumed via a internal web url, which is different from the
 * internal filesystem url.
 */
export class AssetService {

  protected storage: Storage;
  protected resolveUrl: (asset: Asset) => Promise<{ fileUrl: string, webUrl: string }>;

  constructor(
    storage: Storage, 
    resolveUrl: (asset: Asset) => Promise<{ fileUrl: string, webUrl: string }>      
  ) {
    this.storage = storage;
    this.resolveUrl = resolveUrl;
  }

  async resolveInternalUrls(asset: Asset | null) {
    if (asset) {
      const internalUrls = await this.resolveUrl(asset);
      asset.internalWebUrl = internalUrls.webUrl;
      asset.internalFileUrl = internalUrls.fileUrl;
    }
  }

  // with internalUrl resolved
  async getAsset(assetId: string): Promise<Asset> {
    const asset: Asset = this.storage.get(`asset-${assetId}`);
    await this.resolveInternalUrls(asset);
    return asset;
  }

  // with internalUrl resolved
  async getAssets(
    filter: { language?: string, excludeNoLanguage?: boolean } = {}
  ): Promise<Asset[]> {
    const result: Asset[] = this.getUnresolvedAssets(filter);

    for (const asset of result) {
      await this.resolveInternalUrls(asset);
    }

    return result;
  }

  // with internalUrl unresolved
  getUnresolvedAssets(filter: { language?: string, excludeNoLanguage?: boolean } = {}): Asset[] {
    const assets: Asset[] = this.storage.get(`assets`);
    const result: Asset[] = [];

    for (const asset of assets) {
      if (
        (!!filter.language && !!asset.language && asset.language == filter.language) ||
        (!filter.excludeNoLanguage && !asset.language)
      ) {
        result.push(asset);
      }
    }

    return result;
  }
}
