import { ServiceFacade } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';

/**
 * Get stations for a specific tour or all stations if no tour is specified.
 * The string "default" is treated as a placeholder for the default tour id.
 */
export async function getStations(facade: ServiceFacade, tourId: string = null): Promise<Array<Station>> {
  if (tourId === "default") {
    const defaultTour = await facade.getTourService().getDefaultTour();
    return await facade.getTourService().getStations(defaultTour.id);
  } else if (tourId) {
    return await facade.getTourService().getStations(tourId);
  } else {
    return await facade.getStationService().getStations();
  }
}
