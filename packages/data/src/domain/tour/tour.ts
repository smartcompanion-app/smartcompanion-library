import { Asset } from "../asset";
import { Station } from "../station";

export interface Tour {
    id: string;
    title: string;    
    default: boolean;
    language: string;
    number?: string;    
    description?: string;    
    duration?:string;
    stations: Station[]|string[];
    images: Asset[]|string[];
}