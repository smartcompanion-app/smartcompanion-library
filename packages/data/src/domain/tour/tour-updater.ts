import { Storage } from '../../storage';
import { Updater } from '../../update';

export class TourUpdater implements Updater {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async update(data: any) {
    const languageFilteredTours: any = {};

    if (Array.isArray(data)) {
      for (const tour of data) {
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
