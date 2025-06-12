export interface MenuService {

    open(): Promise<void>;

    close(): Promise<void>;

    disable(): Promise<void>;

    enable(): Promise<void>;
}
