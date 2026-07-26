/**
 * Data loading as needed by the loading page, structurally satisfied by
 * the LoadService implementations of @smartcompanion/data.
 */
export interface Loader {
  setProgressListener(listener: (progress: number) => void): void;
  load(): Promise<string>;
}
