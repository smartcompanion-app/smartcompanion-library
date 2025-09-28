import { ServiceFacade } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';

/**
 * Get stations for a specific tour or all stations if no tour is specified.
 * The string "default" is treated as a placeholder for the default tour id.
 */
export async function getStations(
  facade: ServiceFacade,
  tourId: string = null
): Promise<Array<Station>> {
  if (tourId === "default") {
    const defaultTour = await facade.getTourService().getDefaultTour();
    return await facade.getTourService().getStations(defaultTour.id);
  } else if (tourId) {
    return await facade.getTourService().getStations(tourId);
  } else {
    return await facade.getStationService().getStations();
  }
}

export async function getSortedStations(
  facade: ServiceFacade,
  tourId: string = null
): Promise<Array<Station>> {
  const stations = await getStations(facade, tourId);
  return stations.sort((a, b) => {
    const v1 = a.number ? parseInt(a.number) : 0;
    const v2 = b.number ? parseInt(b.number) : 0;
    return v1 - v2;
  });
}
