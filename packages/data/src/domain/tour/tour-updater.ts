import { Storage } from '../../storage';
import { Updater } from '../../update';
import { Tour } from './tour';

export class TourUpdater implements Updater {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async update(data: unknown) {
    const languageFilteredTours: Record<string, Tour[]> = {};

    if (Array.isArray(data)) {
      for (const tour of data as Tour[]) {
        if (!languageFilteredTours[tour.language]) {
          languageFilteredTours[tour.language] = [];
        }

        languageFilteredTours[tour.language].push(tour);
        this.storage.set(`tour-${tour.language}-${tour.id}`, tour);

        if (tour.default) {
          this.storage.set(`tour-${tour.language}-default-id`, tour.id);
        }
      }

      for (const language in languageFilteredTours) {
        this.storage.set(`tours-${language}`, languageFilteredTours[language]);
      }
    }
  }
}
