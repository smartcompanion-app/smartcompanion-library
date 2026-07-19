import { AudioPlayer } from './audio-player';
import { LanguageSwitcher } from './language-switcher';
import { Loader } from './loader';
import { Menu } from './menu';
import { PinValidator } from './pin-validator';
import { Router } from './router';
import { StationSource } from './station-source';
import { TourSource } from './tour-source';
import { Translator } from './translator';

export * from './audio-player';
export * from './language-switcher';
export * from './loader';
export * from './menu';
export * from './pin-validator';
export * from './router';
export * from './station-source';
export * from './tour-source';
export * from './translator';

/**
 * Composed facade slices per page. All types are getter-shaped so that the
 * ServiceFacade of @smartcompanion/services satisfies them structurally —
 * apps keep passing the same facade object, while pages only depend on
 * the surface they actually use.
 */

export type PageErrorFacade = Translator & {
  getMenuService(): Menu;
  getRoutingService(): Router;
};

export type PageLanguageFacade = LanguageSwitcher & {
  getMenuService(): Menu;
  getRoutingService(): Router;
};

export type PageLoadingFacade = {
  getMenuService(): Menu;
  getRoutingService(): Router;
  getLoadService(): Loader;
  getPendingRoute(): string | null;
};

export type PagePinFacade = Translator & {
  getMenuService(): Menu;
  getRoutingService(): Router;
  getPinService(): PinValidator;
};

export type PageTourListFacade = Translator & {
  getMenuService(): Menu;
  getRoutingService(): Router;
  getTourService(): TourSource;
};

/** Shared by page-station-list, page-station-image-list, page-tabbed-station-list, page-map and page-selection */
export type StationListFacade = Translator & {
  getMenuService(): Menu;
  getRoutingService(): Router;
  getTourService(): TourSource;
  getStationService(): StationSource;
};

/** Facade slice needed by the ReactiveAudioPlayer */
export type AudioPlayerFacade = {
  getAudioPlayerService(): AudioPlayer;
  getStationService(): StationSource;
};

/** Shared by page-station and page-stations */
export type PageStationFacade = AudioPlayerFacade & {
  getMenuService(): Menu;
  getTourService(): TourSource;
};

export type PageMultiAudioStationFacade = AudioPlayerFacade & {
  getMenuService(): Menu;
};
