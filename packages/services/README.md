# @smartcompanion/services

The service layer for SmartCompanion apps. `ServiceFacade` assembles the domain services from [`@smartcompanion/data`](https://www.npmjs.com/package/@smartcompanion/data) and adds audio playback, menu state and routing, so an application wires up one object instead of a dozen.

Part of the [SmartCompanion Library](https://github.com/smartcompanion-app/smartcompanion-library) monorepo.

## Install

```bash
npm install @smartcompanion/services
```

Requires Node 20 or newer, and these peers:

```
@smartcompanion/data                ^2.0.0
@smartcompanion/native-audio-player ^1.0.2
@capacitor/core                     ^8.3.1
@ionic/core                         ^9.0.0
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

## Routing

`RoutingService` drives an `ion-router` that renders into an `ion-router-outlet`:

```html
<ion-router use-hash="true">
  <ion-route url="/" component="sc-page-loading" />
  <!-- ... -->
</ion-router>
<ion-router-outlet id="main" />
```

Ionic 9 no longer lets `ion-router` drive an `ion-nav` — an app still built that way renders an empty page. The outlet holds only the current page, so the page stack is the browser history:

- `push(uri)` — new history entry, forward transition
- `replace(uri)` — replaces the current entry, with a forward transition; for pages that must not be returned to (loading, language, pin, error)
- `back(fallbackUri = '/')` — back to the previous page with a back transition, or to `fallbackUri` when there is none, e.g. after opening a deep link
- `canGoBack()` — whether `back()` has a previous page to return to
- `addRouteChangeListener(to, callback)` — `to` is a route, or a prefix ending in `*`

1.x's `pushReplace()` and `pushReplaceCurrent()` are both `replace()` now, and `pop()` is `back()`.

## License

BSD-2-Clause. See [LICENSE](https://github.com/smartcompanion-app/smartcompanion-library/blob/main/LICENSE).
