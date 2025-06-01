export interface Storage {

    set(key: string, value: any): void

    get(key: string): any

    has(key: string): boolean

    unset(key: string): void

    unsetAll(): void

}