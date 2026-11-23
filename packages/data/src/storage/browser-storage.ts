import { namespaceHash } from './namespace-hash.js';
import { Storage } from './storage.js';

export interface BrowserStorageOptions {
  /**
   * Keeps the app's data apart from that of other apps on the same origin, e.g. the
   * absolute URL of the app's data. It has to be the same on every start.
   */
  namespace?: string;
}

/**
 * Keeps the data in the browser's localStorage, which all apps on an origin share.
 *
 * With a namespace every key is prefixed and unsetAll() removes only the prefixed keys.
 * Without one the keys are used as they are and unsetAll() clears the whole localStorage.
 */
export class BrowserStorage implements Storage {
  protected prefix: string;

  constructor(options: BrowserStorageOptions = {}) {
    this.prefix = options.namespace ? `sc-${namespaceHash(options.namespace)}:` : '';
  }

  set(key: string, value: unknown): void {
    if (typeof value == 'object') {
      globalThis.localStorage.setItem(this.prefix + key, `json:${JSON.stringify(value)}`);
    } else {
      globalThis.localStorage.setItem(this.prefix + key, `strg:${value}`);
    }
  }

  get(key: string) {
    const result = globalThis.localStorage.getItem(this.prefix + key);

    if (!result) {
      throw new Error(`reading ${key} was a null value`);
    }

    const type = result.substring(0, 4);
    const data = result.substring(5);
    return type == 'json' ? JSON.parse(data) : data;
  }

  has(key: string): boolean {
    return globalThis.localStorage.getItem(this.prefix + key) != null;
  }

  unset(key: string): void {
    globalThis.localStorage.removeItem(this.prefix + key);
  }

  unsetAll(): void {
    if (this.prefix === '') {
      globalThis.localStorage.clear();
      return;
    }

    // collected first: removing a key while iterating shifts the index of the others
    const keys: string[] = [];
    for (let i = 0; i < globalThis.localStorage.length; i++) {
      const key = globalThis.localStorage.key(i);
      if (key !== null && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }

    keys.forEach(key => globalThis.localStorage.removeItem(key));
  }
}
