import { Storage } from '../storage/index.js';

/**
 * Replaces per-language lists of items in the storage (e.g. `stations-de` with an entry
 * `station-de-<id>` per item) with the items of a new data set.
 *
 * Items and whole languages that are no longer in the data are removed, so an app never
 * shows content that was deleted on the server: without this, a language whose items were
 * all removed would keep its previous list.
 *
 * The languages written are remembered under `<listPrefix>-languages`. The `languages` of
 * the storage are checked as well, for data written before this key existed.
 *
 * Returns every language processed: those in the data and those that were removed.
 */
export function replaceLanguageLists<T extends { id: string; language: string }>(storage: Storage, items: T[], itemPrefix: string, listPrefix: string): string[] {
  const itemsByLanguage: Record<string, T[]> = {};

  for (const item of items) {
    (itemsByLanguage[item.language] ??= []).push(item);
  }

  const languagesKey = `${listPrefix}-languages`;
  const previousLanguages = new Set<string>([...readStrings(storage, languagesKey), ...readLanguages(storage)]);

  const languages = [...new Set([...previousLanguages, ...Object.keys(itemsByLanguage)])];

  for (const language of languages) {
    const listKey = `${listPrefix}-${language}`;
    const currentItems = itemsByLanguage[language] ?? [];
    const currentIds = new Set(currentItems.map(item => item.id));
    const previousItems = storage.has(listKey) ? (storage.get(listKey) as T[]) : [];

    for (const previousItem of previousItems) {
      if (!currentIds.has(previousItem.id)) {
        storage.unset(`${itemPrefix}-${language}-${previousItem.id}`);
      }
    }

    for (const item of currentItems) {
      storage.set(`${itemPrefix}-${language}-${item.id}`, item);
    }

    if (currentItems.length > 0) {
      storage.set(listKey, currentItems);
    } else {
      storage.unset(listKey);
    }
  }

  storage.set(languagesKey, Object.keys(itemsByLanguage));

  return languages;
}

function readStrings(storage: Storage, key: string): string[] {
  const value = storage.has(key) ? storage.get(key) : [];

  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function readLanguages(storage: Storage): string[] {
  const value = storage.has('languages') ? storage.get('languages') : [];

  return Array.isArray(value) ? value.map(entry => (entry as { language?: unknown })?.language).filter((language): language is string => typeof language === 'string') : [];
}
