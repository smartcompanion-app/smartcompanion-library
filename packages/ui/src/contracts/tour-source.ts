import { Station, Tour } from '@smartcompanion/data';

/**
 * Tour access as needed by pages, structurally satisfied by
 * the TourService of @smartcompanion/data.
 */
export interface TourSource {
  getTours(): Promise<Tour[]>;
  getDefaultTour(): Promise<Tour>;
  getStations(tourId: string): Promise<Station[]>;
}
