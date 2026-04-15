import { AssetService, StationService, Tour, Station } from '..';
import { Storage } from '../../storage';

export class TourService {
  protected storage: Storage;
  protected assetService: AssetService;
  protected stationService: StationService;

  constructor(storage: Storage, assetService: AssetService, stationService: StationService) {
    this.storage = storage;
    this.assetService = assetService;
    this.stationService = stationService;
  }

  getLanguage(): string {
    return this.storage.get('language') as string;
  }

  async getStations(tourId: string): Promise<Station[]> {
    const tour = this.storage.get(`tour-${this.getLanguage()}-${tourId}`) as Tour;
    const result: Station[] = [];

    for (const station of tour.stations) {
      const resovedStation = await this.stationService.getStation(station as string);
      result.push(resovedStation);
    }

    return result;
  }

  async getTours(): Promise<Tour[]> {
    const tours = this.storage.get(`tours-${this.getLanguage()}`) as Tour[];
    const result: Tour[] = [];

    for (const tour of tours) {
      const resovedTour = await this.getTour(tour.id);
      result.push(resovedTour);
    }

    return result;
  }

  /**
   *
   * Returns the corresponding tour for the tourId
   * The stations are not retrieved, the getStations(tourId)
   * method is provided for that
   *
   * @param tourId
   * @returns
   */
  async getTour(tourId: string): Promise<Tour> {
    const tour = this.storage.get(`tour-${this.getLanguage()}-${tourId}`) as Tour;

    if (tour && tour.images) {
      for (let i = 0; i < tour.images.length; i++) {
        tour.images[i] = await this.assetService.getAsset(tour.images[i] as string);
      }
    }

    return tour;
  }

  async getDefaultTour(): Promise<Tour> {
    const tourId = this.storage.get(`tour-${this.getLanguage()}-default-id`) as string;
    return this.getTour(tourId);
  }
}
