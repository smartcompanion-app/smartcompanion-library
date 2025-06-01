import { Storage } from './storage';

export class BrowserStorage implements Storage {

    set(key: string, value: any): void {
        if (typeof(value) == 'object') {
            globalThis.localStorage.setItem(key, `json:${JSON.stringify(value)}`);
        } else {
            globalThis.localStorage.setItem(key, `strg:${value}`);
        }
    }

    get(key: string) {
        const result = globalThis.localStorage.getItem(key);

        if (!result) {
            throw new Error(`reading ${key} was a null value`);
        }

        const type = result.substring(0, 4);
        const data = result.substring(5);
        return type == 'json' ? JSON.parse(data) : data;
    }

    has(key: string): boolean {
        return globalThis.localStorage.getItem(key) != null;
    }

    unset(key: string): void {
        globalThis.localStorage.removeItem(key);
    }

    unsetAll(): void {
        globalThis.localStorage.clear();
    }
}
