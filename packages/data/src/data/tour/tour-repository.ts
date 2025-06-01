import { AssetRepository, StationRepository, Tour, Station } from "..";
import { Storage } from "../../storage";

export class TourRepository {

    protected storage: Storage;
    protected assetRepository: AssetRepository;
    protected stationRepository: StationRepository;

    constructor(storage: Storage, assetRepository: AssetRepository, stationRepository: StationRepository) {
        this.storage = storage;
        this.assetRepository = assetRepository;
        this.stationRepository = stationRepository;
    } 

    getLanguage(): string {
        return this.storage.get('language');
    }

    async getStations(tourId: string): Promise<Station[]> {
        const tour:Tour = this.storage.get(`tour-${this.getLanguage()}-${tourId}`);
        const result: Station[] = [];
            
        for (const station of tour.stations) {
            const resovedStation = await this.stationRepository.getStation(station as string);
            result.push(resovedStation);
        }

        return result;
    }

    async getTours(): Promise<Tour[]> {
        const tours:Tour[] = this.storage.get(`tours-${this.getLanguage()}`);
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
        const tour:Tour = this.storage.get(`tour-${this.getLanguage()}-${tourId}`);

        if (tour && tour.images) {
            for (let i = 0; i < tour.images.length; i++) {
                tour.images[i] = await this.assetRepository.getAsset(tour.images[i] as string);
            }            
        }

        return tour;
    }    

    async getDefaultTour(): Promise<Tour> {
        const tourId = this.storage.get(`tour-${this.getLanguage()}-default-id`);
        return this.getTour(tourId);
    }

}
