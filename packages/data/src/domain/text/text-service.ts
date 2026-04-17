import { Storage } from '../../storage';

export class TextService {
  protected storage: Storage;
  protected cache: Record<string, string>;

  constructor(storage: Storage) {
    this.storage = storage;
    this.cache = {};
  }

  getCurrentLanguage() {
    if (!this.storage.has('language')) {
      return 'en'; // default set en for texts
    } else {
      return this.storage.get('language') as string;
    }
  }

  /**
   * A translation key can have alternative keys, e.g. with _ or - as separator
   */
  getAllKeys(key: string, storageKeyPrefix: string): string[] {
    const keys: string[] = [];
    keys.push(`${storageKeyPrefix}${key}`);
    if (key.includes('_')) {
      keys.push(`${storageKeyPrefix}${key.replace('_', '-')}`);
    }
    if (key.includes('-')) {
      keys.push(`${storageKeyPrefix}${key.replace('-', '_')}`);
    }
    return keys;
  }

  getText(key: string): string {
    const language = this.getCurrentLanguage();
    const storageKeyPrefix = `texts-${language}-`;
    const storageKey = `${storageKeyPrefix}${key}`;

    if (this.cache[storageKey]) {
      return this.cache[storageKey];
    }

    const allKeys = this.getAllKeys(key, storageKeyPrefix);
    for (const k of allKeys) {
      if (this.storage.has(k)) {
        this.cache[storageKey] = this.storage.get(k) as string;
        return this.cache[storageKey];
      }
    }

    // fallback, if no translation is available, return lowercase key with spaces
    return key.replace('_', ' ').replace('-', ' ').toLowerCase();
  }
}
