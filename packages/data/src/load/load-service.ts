export interface LoadService {
  setProgressListener: (listener: (progress: number) => void) => void;
  load: () => Promise<string>;
}
