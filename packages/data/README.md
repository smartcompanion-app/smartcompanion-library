# @smartcompanion/data

Domain models and the data layer behind the SmartCompanion apps: tours, stations, assets, languages, text, pins and servers, plus the storage, loading and update machinery that keeps them in sync.

Part of the [SmartCompanion Library](https://github.com/smartcompanion-app/smartcompanion-library) monorepo. `@smartcompanion/services` and `@smartcompanion/ui` are built on top of it.

## Install

```bash
npm install @smartcompanion/data
```

Requires Node 20 or newer.

> **ESM only.** This package declares `"type": "module"` and ships an `exports` map. `import` works from Node and from bundlers; `require()` is not supported.

## What's in it

| Area | Contents |
| --- | --- |
| Domain | `AssetService`, `LanguageService`, `PinService`, `ServerService`, `ShareService`, `StationService`, `TextService`, `TourService` — each with a matching updater |
| Storage | `Storage` interface with `BrowserStorage` and `MemoryStorage` implementations |
| Loading | `LoadService`, `OnlineLoadService`, `OfflineLoadService` |
| Updating | `Updater`, `DataUpdater` |

Most applications will not construct these directly — [`@smartcompanion/services`](https://www.npmjs.com/package/@smartcompanion/services) wires them together behind a single `ServiceFacade`.

## Offline callbacks

`OfflineLoadService` is driven by five callbacks, supplied by the host application because the filesystem differs per platform:

| Callback | Responsibility |
| --- | --- |
| `downloadData` | Download data and return parsed JSON |
| `downloadFile` | Download an asset file and return a blob |
| `remove` | Remove a file by filename from the filesystem |
| `save` | Store a blob locally |
| `list` | List all local files |

## Data format

The JSON schema describing the tour data format lives in the [data-format](https://github.com/smartcompanion-app/data-format) repository. To explore it as a form, open [JSON-Editor](https://json-editor.github.io/json-editor/) and paste the schema in.

## License

BSD-2-Clause. See [LICENSE](https://github.com/smartcompanion-app/smartcompanion-library/blob/main/LICENSE).
