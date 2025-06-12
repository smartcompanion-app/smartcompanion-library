import { LoadService, Language, RepositoryMap } from '@smartcompanion/data';
import { RoutingService, MenuService, AudioService } from '../services';

export interface ServiceFacade {
  
  routing(): RoutingService;
  menu(): MenuService;
  load(): LoadService;
  audio(): AudioService;
  repository<K extends keyof RepositoryMap>(name: K): RepositoryMap[K];

  

  changeLanguage(language: string): void;  
  getLanguages(): Language[];  
  __(key: string): string;
 
}
