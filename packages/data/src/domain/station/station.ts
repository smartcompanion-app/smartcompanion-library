import { Asset } from "../asset";

export interface Station {
    id: string;
    title: string;
    language: string;
    subtitle?: string;
    number?: string;
    description?: string;
    latitude?:number,
    longitude?:number,
    images: Asset[]|string[];
    audios: Asset[]|string[];
    tasks?: string[];

    // how much of the stations assets was consumed
    collectedPercentage?: number;
}