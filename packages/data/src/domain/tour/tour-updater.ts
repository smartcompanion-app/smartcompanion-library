import { Storage } from '../../storage/index.js';
import { Updater } from '../../update/updater.js';
import { replaceLanguageLists } from '../../update/language-lists.js';
import { Tour } from './tour.js';

export class TourUpdater implements Updater {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  /**
   * Stores the tours and the default tour per language; tours no longer in the data are removed.
   */
  async update(data: unknown) {
    if (Array.isArray(data)) {
      const tours = data as Tour[];

      for (const language of replaceLanguageLists(this.storage, tours, 'tour', 'tours')) {
        const defaultTour = tours.find(tour => tour.language === language && tour.default);

        if (defaultTour) {
          this.storage.set(`tour-${language}-default-id`, defaultTour.id);
        } else {
          this.storage.unset(`tour-${language}-default-id`);
        }
      }
    }
  }
}
