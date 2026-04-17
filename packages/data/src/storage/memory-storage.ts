import { Storage } from './storage';

export class MemoryStorage implements Storage {
  protected storage: Record<string, unknown> = {};

  set(key: string, value: unknown): void {
    this.storage[key] = value;
  }

  get(key: string) {
    if (this.has(key)) return this.storage[key];
    throw new Error(`reading ${key} was a null value`);
  }

  has(key: string): boolean {
    return this.storage[key] !== undefined;
  }

  unset(key: string): void {
    if (this.has(key)) delete this.storage[key];
  }

  unsetAll(): void {
    this.storage = {};
  }
}
