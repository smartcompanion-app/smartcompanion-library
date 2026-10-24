# UI components

`@smartcompanion/ui` holds the web components visitors see. They are built with [Stencil](https://stenciljs.com/), so they work in any framework or none.

```bash
npm install @smartcompanion/ui
```

Every component is live in [Storybook](pathname:///storybook/), with its properties and events.

## Using them

Importing the package registers every custom element:

```ts
import '@smartcompanion/ui';
```

Pages take the [service facade](./services.md) as their `facade` property — through `componentProps` on a route:

```tsx
<ion-route url="/selection" component="sc-page-selection" componentProps={{ facade: serviceFacade }} />
```

The package's entry points are the root, `@smartcompanion/ui/loader` (`defineCustomElements`, for apps that register the elements themselves) and `@smartcompanion/ui/dist/collection/*`. A Stencil app builds the components from that collection together with its own, rather than loading the prebuilt bundle.

## Pages

Each page is a full screen with its own header. Properties every list page shares: `headerBackgroundColor` (`'primary'` or `'secondary'`) and `tourId` — show only that tour's stations; `'default'` means the [default tour](../content/tours.md#the-default-tour).

| Page | What it shows | Notable properties |
| --- | --- | --- |
| `sc-page-loading` | Logo and progress while the content loads, then moves on by itself | `image`, `imageDark`, `homeRoute` (`/stations/default`), `spinnerColor`, `progressBarColor`, `loadingTextColor` |
| `sc-page-language` | The language choice | — |
| `sc-page-pin` | The PIN keypad | `validHours` (6) |
| `sc-page-error` | The load error, with a retry button | — |
| `sc-page-stations` | Station list and player in one — the default app's main screen | `stationId`, `tourId`, `enableSwitchAudioOutput` |
| `sc-page-station` | One station with its player | `stationId`, `tourId`, `enableBackButton`, `defaultBackButtonHref`, `enableSwitchAudioOutput` |
| `sc-page-multi-audio-station` | One station with several tracks to choose from | `stationId`, `tourId`, `defaultBackButtonHref`, `enableSwitchAudioOutput` |
| `sc-page-selection` | The number keypad | `maxLength` (2), `tourId` |
| `sc-page-station-list` | A plain list of stations | `tourId` |
| `sc-page-station-image-list` | Stations as a list of images | `tourId` |
| `sc-page-tabbed-station-list` | `sc-page-station-image-list` and `sc-page-station-list` as two tabs | `tourId` |
| `sc-page-tour-list` | The tours, with cover images and descriptions | — |
| `sc-page-map` | Stations on a map | `mapBounds`, `mapStyleUrl` or `tileUrlTemplate`, `mapAttribution`, `tourId`, `enableBackButton`, `defaultBackButtonHref` |

Station lists are sorted by `number`. The list pages and `sc-page-stations` sort a tour's stations the same way; `sc-page-station` and `sc-page-map` keep the tour's order.

`sc-page-stations` and `sc-page-station` make two assumptions about the content:

- **Each station has exactly one audio track.** The player's playlist has one item per audio asset, and the pages pass a station's position in the list as the playlist index. A station with no audio, or with several, shifts every station after it onto the wrong track. Stations with several tracks belong on `sc-page-multi-audio-station`.
- **`sc-page-stations` needs two images per station.** It shows the active station's first image large, and each station's second image on its card in the list; a station with a single image fails to render. `sc-page-station` shows the first image only. The image slideshow is on `sc-page-multi-audio-station`.

### Facade slices

Pages do not import `@smartcompanion/services`. Each declares the part of the facade it uses as a type — `PageLoadingFacade`, `StationListFacade`, `PageStationFacade` and so on, exported from the package — and `ServiceFacade` satisfies all of them structurally. A test, or an app with its own services, can pass anything that has the same shape.

## Building blocks

The pages are made of five smaller components, which an app can use on its own:

| Component | What it is | Properties | Events |
| --- | --- | --- | --- |
| `sc-player-controls` | Play/pause, previous, next and a seek bar | `playing`, `position`, `duration`, `disabled` | `playPause`, `prev`, `next`, `startPositionChange`, `positionChange`, `endPositionChange` |
| `sc-station-icon` | A station number with its listening-progress ring | `collected`, `collectedPercent`, `size`, `lowerLimitPercent`, `upperLimitPercent` | — |
| `sc-numpad` | A numeric keypad | `full` | `number`, `delete`, `confirm` |
| `sc-image-slideshow` | A swipeable image gallery | `images` | — |
| `sc-marquee` | Text that scrolls when it does not fit | `active` | — |

## Texts

Pages look up their interface texts through the facade's `__()`, which reads the `texts` of the loaded content. Provide each of these keys in every language the app offers:

| Key | Page |
| --- | --- |
| `no-internet`, `try-again` | `sc-page-error` |
| `enter-pin`, `pin-error` | `sc-page-pin` |
| `menu-selection` | `sc-page-selection` |
| `menu-overview`, `start-tour` | `sc-page-tour-list` |
| `station-list` | `sc-page-station-list`, `sc-page-station-image-list` |
| `view` | `sc-page-station-image-list` |
| `menu-map` | `sc-page-map` |

The list is exported as the `TranslationKey` type. Keys an app uses in its own components — the default app's menu, for instance — are not restricted by it. A missing key shows as the key itself; see [UI texts](../content/ui-texts.md#when-a-text-is-missing).

## Accessibility

Every component and page is checked with axe-core in the library's tests, and the issues each has today are recorded — see [Development](./development.md#accessibility). The known ones, in short:

- **Images have no alternative text** — station pictures, the slideshow, the loading page's logo.
- **Icon-only buttons have no accessible name** — the player's previous, play/pause and next, the numpad's delete and confirm, the menu button, and the multi-track page's info button. Their icons are not hidden from screen readers either.
- **The tabbed station list's tabs** have no accessible names, and the image list's list structure is incomplete.
- **The loading spinner** has no accessible name.

`sc-page-language`, `sc-page-station-list`, `sc-page-map`, `sc-marquee` and `sc-station-icon` have no known violations. Contrast is checked against Ionic's default palette only — an app with its own colours checks its own.

## Theming

The components read the app's palette from CSS custom properties: the `--sc-*` properties described in [Colors](../customization/colors.md#the-variables-that-reach-the-browser), and Ionic's `--ion-color-*` that those map onto. Define them in the app's global stylesheet — the audioguide app's [`app.scss`](https://github.com/smartcompanion-app/audioguide-app/blob/main/src/global/app.scss) is a complete example, for light and dark mode.

## Maps

`sc-page-map` renders with [MapLibre GL](https://maplibre.org/). It needs `mapBounds` — top-left and bottom-right latitude/longitude — and exactly one of `mapStyleUrl`, for vector tiles, or `tileUrlTemplate`, a raster `{z}/{y}/{x}` template.

MapLibre draws in a web worker loaded from a file of its own, and that file cannot be bundled into the page's code. `sc-page-map` therefore ships the worker as a component asset, which a consuming Stencil app copies to `build/assets/maplibre-gl-worker.mjs`. Two consequences for apps:

- **Do not filter the component's assets out** of the build — without the worker every map logs "Worker failed to load".
- **Precache the worker for offline use.** An app with a service worker adds `build/assets/maplibre-gl-worker.mjs` to its precache patterns, or the map fails offline.

`sc-page-map` points MapLibre at the shipped worker only if no worker URL is set yet, so an app that serves the worker itself and calls `setWorkerUrl()` first keeps its own.

`maplibre-gl` is pinned to an exact version in the library, so the map code and the shipped worker always match.
