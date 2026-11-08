import { Asset, Station } from '@smartcompanion/data';
import { StationSource, TourSource } from '../contracts';

export type StationDataFacade = {
  getTourService(): TourSource;
  getStationService(): StationSource;
};

/**
 * Get stations for a specific tour or all stations if no tour is specified.
 * The string "default" is treated as a placeholder for the default tour id.
 */
export async function getStations(facade: StationDataFacade, tourId: string | null = null): Promise<Array<Station>> {
  if (tourId === 'default') {
    const defaultTour = await facade.getTourService().getDefaultTour();
    return await facade.getTourService().getStations(defaultTour.id);
  } else if (tourId !== null && tourId !== undefined && tourId !== '') {
    return await facade.getTourService().getStations(tourId);
  } else {
    return await facade.getStationService().getStations();
  }
}

export async function getSortedStations(facade: StationDataFacade, tourId: string | null = null): Promise<Array<Station>> {
  const stations = await getStations(facade, tourId);
  return stations.sort((a, b) => {
    const v1 = parseInt(a.number ?? '') || 0;
    const v2 = parseInt(b.number ?? '') || 0;
    return v1 - v2;
  });
}

/** Anything with images: a station or a tour, as getStation(), getStations() and getTours() return it */
type WithImages = { images: Asset[] | string[] };

/**
 * The web url of image `index` of a station or tour, falling back to its first image.
 * Undefined when it has no image at all.
 */
export function getImageUrl(item: WithImages | undefined, index: number = 0): string | undefined {
  const images = (item?.images ?? []) as Asset[];
  return (images[index] ?? images[0])?.internalWebUrl;
}

/**
 * The web urls of all images of a station or tour, leaving out any without one
 */
export function getImageUrls(item: WithImages | undefined): string[] {
  return ((item?.images ?? []) as Asset[]).map(image => image.internalWebUrl).filter((url): url is string => url !== undefined);
}
