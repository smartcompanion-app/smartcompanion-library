export interface Storage {
  set(key: string, value: unknown): void;
  get(key: string): unknown;
  has(key: string): boolean;
  unset(key: string): void;
  unsetAll(): void;
}
