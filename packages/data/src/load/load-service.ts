export class LoadService {
  setProgressListener: (listener: (progress: number) => void) => void;
  load: () => Promise<string>;
}
