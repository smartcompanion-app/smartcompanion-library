export interface Updater {
    update(data: any): Promise<void>;
}
