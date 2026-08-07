# @smartcompanion/services

The service layer for SmartCompanion apps. `ServiceFacade` assembles the domain services from [`@smartcompanion/data`](https://www.npmjs.com/package/@smartcompanion/data) and adds audio playback, menu state and routing, so an application wires up one object instead of a dozen.

Part of the [SmartCompanion Library](https://github.com/smartcompanion-app/smartcompanion-library) monorepo.

## Install

```bash
npm install @smartcompanion/services
```

Requires Node 20 or newer, and these peers:

```
@smartcompanion/data                >=0.9.0
@smartcompanion/native-audio-player ^0.5.0
@capacitor/core                     ^8.3.1
@ionic/core                         ^8.7.2
```

> **ESM only.** This package declares `"type": "module"` and ships an `exports` map. `import` works from Node and from bundlers; `require()` is not supported.

## Usage

Create the facade, choose an audio player, and choose how data is loaded:

```ts
import { ServiceFacade } from '@smartcompanion/services';

const facade = new ServiceFacade();

// Collectible tracks progress per station; the default player does not.
facade.registerCollectibleAudioPlayerService('My Audio Guide');

facade.registerOnlineLoadService(() =>
  fetch('https://example.com/data.json', { cache: 'no-store' }).then(r => r.json()),
);
```

For an offline-capable app, register `registerOfflineLoadService` instead and supply the five filesystem callbacks documented in [`@smartcompanion/data`](https://www.npmjs.com/package/@smartcompanion/data).

The facade is then handed to the page components from [`@smartcompanion/ui`](https://www.npmjs.com/package/@smartcompanion/ui) as their `facade` prop.

## What it exposes

- **Accessors** — `getStationService()`, `getTourService()`, `getAssetService()`, `getTextService()`, `getLanguageService()`, `getPinService()`, `getServerService()`, `getShareService()`, `getStorage()`
- **App services** — `getAudioPlayerService()`, `getMenuService()`, `getRoutingService()`, `getLoadService()`
- **Language** — `changeLanguage()`, `getLanguages()`
- **Routing guards** — `canLoadRoute()`, `getPendingRoute()`

`AudioPlayerService`, `MenuService` and `RoutingService` are also exported directly if you need them outside the facade.

## License

BSD-2-Clause. See [LICENSE](https://github.com/smartcompanion-app/smartcompanion-library/blob/main/LICENSE).
