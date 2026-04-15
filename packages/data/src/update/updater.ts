export interface Updater {
  update(data: unknown): Promise<void>;
}
