import { Storage } from './storage';

export class MemoryStorage implements Storage {

    protected storage:any = {};

    set(key: string, value: any): void {
        this.storage[key] = value;
    }

    get(key: string) {
        if (this.has(key)) return this.storage[key];
        return null;
    }

    has(key: string): boolean {
        return !!this.storage[key];
    }

    unset(key: string): void {
        if (this.has(key)) delete this.storage[key];
    }

    unsetAll(): void {
        this.storage = {};
    }

}