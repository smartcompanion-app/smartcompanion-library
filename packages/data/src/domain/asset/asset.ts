export interface Asset {
    id: string;        
    filename: string;
    externalUrl: string; // external or remote url    
    internalFileUrl?: string; // internal url, inside app, filesystem url
    internalWebUrl?: string; // intneral url, inside app, internal webserver url  
    language?: string;
    title?: string; // only for audios
    duration?: number; // only for audios
}
