# Services

`@smartcompanion/services` assembles the domain services of [`@smartcompanion/data`](./data.md) into one `ServiceFacade`, and adds what an app needs around them: audio playback, the menu, and routing. An app wires up this one object instead of a dozen.

```bash
npm install @smartcompanion/services
```

Peer dependencies: `@smartcompanion/data` 2, `@smartcompanion/native-audio-player` 1.0.2 or newer, `@capacitor/core` 8, `@ionic/core` 9.

## The facade

```ts
import { ServiceFacade } from '@smartcompanion/services';

const facade = new ServiceFacade();
facade.registerCollectibleAudioPlayerService('My Audioguide');
facade.registerOnlineLoadService(() => fetch(DATA_URL, { cache: 'no-store' }).then(response => response.json()));
```

The constructor takes an optional `Storage` (default `BrowserStorage`) and an optional `resolveUrl` for asset URLs — see [Data](./data.md#asset-urls).

Two things must be registered; everything else is created on first use:

| Register | Choices |
| --- | --- |
| An audio player | `registerCollectibleAudioPlayerService(subtitle)` or `registerDefaultAudioPlayerService(subtitle)` |
| A load service | `registerOnlineLoadService(downloadData)` or `registerOfflineLoadService(downloadData, downloadFile, remove, save, list)` |

Using the audio player or the load service before registering one throws an error that says which call is missing.

### What it exposes

| Group | Methods |
| --- | --- |
| Domain services | `getStationService()`, `getTourService()`, `getAssetService()`, `getTextService()`, `getLanguageService()`, `getPinService()`, `getServerService()`, `getShareService()`, `getStorage()` |
| App services | `getAudioPlayerService()`, `getMenuService()`, `getRoutingService()`, `getLoadService()` |
| Language | `changeLanguage(code)`, `getLanguages()` |
| Texts | `__(key)` |
| Routing | `canLoadRoute()`, `getPendingRoute()` |

### Texts

`__(key)` returns the text for `key` in the current language. Before a language is chosen it returns the key; for a key missing from the content, the key lower-cased with its first hyphen as a space.

### The route guard

`canLoadRoute()` is meant for `beforeEnter` on routes that need content. When the content is loaded it returns `true`. Otherwise it stores the requested route and returns `{ redirect: '/' }`; the loading page reads the stored route with `getPendingRoute()` and continues there once loading is done. That is what makes a deep link work on a fresh device.

## The audio player

`AudioPlayerService` plays a list of stations through [`@smartcompanion/native-audio-player`](https://github.com/smartcompanion-app/native-audio-player), which uses the platform's audio session in a native app and an HTML audio element in a browser.

- `start(stations)` loads the stations as the playlist — one item per audio asset, titled with the asset's or the station's title, with the station's first image as artwork and the registered subtitle underneath.
- `select(index)`, `play()`, `pause()`, `seek(position)`, `next()`, `prev()`, `stop()` control it.
- `registerUpdateListener(callback)` reports `playing`, `paused`, `skip` and `completed`.
- `setEarpiece()` and `setSpeaker()` switch the output in a native app.

**The collectible player**, `CollectibleAudioPlayerService`, additionally tracks how much of each station has been listened to. It reports a `collected` update with the percentage, which the pages store through `StationService` and show as the progress ring.

The pages drive the player themselves; an app only registers it.

## The menu

`MenuService` opens, closes, enables and disables the app's `ion-menu`: `open()`, `close()`, `enable()`, `disable()`. The loading, language, PIN and error pages disable the menu; the content pages enable it again.

It talks to the `ion-menu` element itself, never to Ionic's `menuController`. A Stencil app compiles Ionic's components from source, while `import { menuController } from '@ionic/core'` resolves to Ionic's standalone build — a second controller no menu registers with. For the same reason `services` imports Ionic for its types only.

## Routing

`RoutingService` navigates between pages: `push()`, `replace()`, `back()`, `canGoBack()` and `addRouteChangeListener()`. It has a page of its own: [Routing](./routing.md).
