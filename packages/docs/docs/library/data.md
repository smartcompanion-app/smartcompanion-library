# Data

`@smartcompanion/data` holds the domain models and the data layer: it takes a file in the [data format](../content/data-format.md), stores it, and answers questions about it — the stations of a tour, the texts of a language, whether a PIN is still valid.

```bash
npm install @smartcompanion/data
```

Most apps never construct these classes themselves: [`ServiceFacade`](./services.md) wires them together. This page is for understanding what happens underneath, and for apps that need to change it.

## What is in it

| Area | Contents |
| --- | --- |
| Models | `Station`, `Tour`, `Asset`, `Language`, `Text` |
| Domain services | `StationService`, `TourService`, `AssetService`, `LanguageService`, `TextService`, `PinService`, `ServerService`, `ShareService` |
| Storage | The `Storage` interface, with `BrowserStorage` and `MemoryStorage` |
| Loading | `LoadService`, with `OnlineLoadService` and `OfflineLoadService` |
| Files | `FileUpdater` and `FileMatcher`, which the offline service uses to download what is missing and remove what is no longer listed |
| Updating | `DataUpdater`, and an updater per part of the data |

## Storage

Everything the library knows is kept in a `Storage`:

```ts
interface Storage {
  set(key: string, value: unknown): void;
  get(key: string): unknown;
  has(key: string): boolean;
  unset(key: string): void;
  unsetAll(): void;
}
```

`BrowserStorage` — the default — keeps it in the browser's `localStorage`, so the content, the chosen language, listening progress and the PIN state survive a reload. `MemoryStorage` keeps it in memory, for tests.

## Updating

`DataUpdater` writes a content file into the storage, one updater per top-level key — `assets`, `stations`, `languages`, `texts`, `tours`, `pins`, `servers`, `share`.

It only does so when the file is valid — `checksum` a string, and `assets`, `stations`, `languages` and `texts` arrays — and when its `checksum` differs from the stored one. Otherwise the stored content stays as it is. That is why a content change needs a new [checksum](../content/data-format.md#checksum).

Stations and tours are stored per language. Each domain service reads the current language from the storage, so after `changeLanguage()` every service answers in the new language.

## Loading

A load service brings the content in and decides where the app goes next. `load()` resolves to one of four results, which `sc-page-loading` turns into a route:

| Result | Meaning | `sc-page-loading` goes to |
| --- | --- | --- |
| `language` | No language is chosen yet | `/language` |
| `pin` | The content asks for a PIN that has not been entered | `/pin` |
| `home` | Ready | the pending route, or `homeRoute` |
| `error` | The content could not be loaded | `/error` |

Before deciding, both services choose a language if they can: from a `?language=` query parameter naming an offered language, or the only language when there is one.

### Online

```ts
new OnlineLoadService(downloadData, dataUpdater, languageService, pinService);
```

`downloadData` returns the parsed content. Media is fetched when it is played or shown.

### Offline

```ts
new OfflineLoadService(downloadData, downloadFile, remove, save, list, dataUpdater, storage, languageService, pinService, assetService);
```

After the content, it downloads the media of the current language — every asset tagged with that language, and every asset without one — and reports progress. It compares the files `list()` reports with the assets it needs: what is missing is downloaded, what is no longer needed is removed. It is driven by five callbacks, because storing a file differs per platform:

| Callback | Responsibility |
| --- | --- |
| `downloadData()` | Download the content and return it parsed |
| `downloadFile(url)` | Download one asset |
| `remove(filename)` | Remove a stored file |
| `save(filename, data)` | Store a downloaded file |
| `list()` | List the stored files |

In a web app a service worker does the storing, so `downloadFile` just fetches and the other three do nothing — see the [app's wiring](../reference/architecture.md#data-loading). Since `list()` then reports no files, every asset is requested again on every load, and the service worker answers from its cache. A native app writes to the device's file system instead.

When loading fails — the device is offline, say — the offline service still reports `home` if everything was loaded before, so the guide keeps working.

## Asset URLs

An asset has an `externalUrl` from the content file, and two URLs the app plays and shows it from: `internalWebUrl` and `internalFileUrl`. A `resolveUrl` function fills them in. By default both are the `externalUrl`; a native app that stores media on the device passes its own, returning the local file's URL:

```ts
const facade = new ServiceFacade(new BrowserStorage(), async asset => ({
  webUrl: Capacitor.convertFileSrc(`${filesDir}/${asset.filename}`),
  fileUrl: `${filesDir}/${asset.filename}`,
}));
```

## The domain services

| Service | Answers |
| --- | --- |
| `StationService` | `getStations()`, `getStation(id)` — with assets resolved — and the listening progress per station |
| `TourService` | `getTours()`, `getTour(id)`, `getDefaultTour()`, `getStations(tourId)` |
| `AssetService` | `getAsset(id)`, `getAssets(filter)` |
| `LanguageService` | `getLanguages()`, `getCurrentLanguage()`, `hasLanguage()`, `changeLanguage(code)` |
| `TextService` | `getText(key)` in the current language |
| `PinService` | `isPinValidationRequired()`, `isValid()`, `validatePin(pin, validHours)` |
| `ShareService` | `hasShare()`, `getShare()` |
| `ServerService` | `hasServers()`, `getRandomServer()` |

`TourService.getStations()` resolves a tour's entries as station **ids** — see [Tours](../content/tours.md#stations-are-referenced-by-id).
