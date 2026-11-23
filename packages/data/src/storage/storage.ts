/**
 * Holds the data of one app. Apps that share a storage medium, such as the localStorage
 * of an origin, each need an instance that keeps their data apart.
 */
export interface Storage {
  set(key: string, value: unknown): void;
  get(key: string): unknown;
  has(key: string): boolean;
  unset(key: string): void;
  /** Removes the data of this app only */
  unsetAll(): void;
}
