# Screens

The screens a visitor moves through, and the library pages the default app leaves unused.

## Routes in the default app

The app uses Ionic's router with hash-based URLs, wired up in [`src/components/app-root/app-root.tsx`](https://github.com/smartcompanion-app/audioguide-app/blob/main/src/components/app-root/app-root.tsx). Each route renders a page from the library into an `ion-router-outlet`:

| Route | Page | Entered when |
| --- | --- | --- |
| `/` | `sc-page-loading` | always |
| `/language` | `sc-page-language` | always |
| `/selection` | `sc-page-selection` | the content has loaded |
| `/stations/:stationId` | `sc-page-stations` | the content has loaded |
| `/pin` | `sc-page-pin` | a language is chosen |
| `/error` | `sc-page-error` | always |

A route that needs loaded content sends the visitor to `/` first and returns them afterwards, so a link straight to `#/stations/3` works on a fresh device: it loads, then opens station 3.

URLs are hash-based (`https://guide.example.org/#/stations/3`), which is what lets the app run on any static host without rewrite rules.

## Loading

The first screen. It shows your logo — light or dark, following the device — while the app fetches `data.json` and, in offline mode, downloads the media with a progress bar.

Online, this is a flash. Offline, it is where the download happens, and it can take minutes on a busy venue Wi-Fi — the argument for keeping the download small, see [Media](../content/media.md#budgeting-an-offline-download).

From here the app goes to the language screen, the PIN screen, the stations, or — if the content could not be loaded — the error screen.

## Language

A list of the languages in your `languages` array, each labelled in its own language.

Shown on first launch when you offer more than one language, and reachable later from the menu's language item. With a single language, or a link carrying `?language=`, it is skipped — see [Languages](../content/languages.md#how-a-language-gets-chosen).

## Stations

The main screen. `sc-page-stations` is the station picture, the player and the station list in one. From the top: the active station's first image, large; the player controls; then every station as a card in a swipeable list, sorted by number. Swiping the list or tapping a card changes the active station.

Each card shows the station's second image, its number, title and a progress ring that fills as the audio is listened to, so a visitor can see at a glance what they have already heard.

The screen needs two images and exactly one audio per station — see [Stations](../content/stations.md#what-the-default-app-expects).

`/stations/default` is the entry the menu uses: all stations, starting at the first.

## Selection

A numeric keypad. The visitor types the number on the sign in front of them and goes straight to that station.

This is how people use an audioguide in a museum: they stand in front of object 14 and want to hear about object 14. The list is for browsing; the keypad is for arriving.

It matches `stations[].number` exactly, as a string, and takes **two digits** by default — the `maxLength` property of `sc-page-selection`. A guide with more than 99 stations raises it on the route in its fork. See [Stations](../content/stations.md#numbering).

## PIN

Shown only when your data file has a `pins` array. A keypad between the visitor and the guide, with your `enter-pin` text above it and `pin-error` on a wrong code. See [Access and sharing](../content/access-and-sharing.md#pin-codes).

## Error

Where the app lands when it cannot load its content — a wrong `data_url`, a CORS failure, a host that is down, or an offline device with nothing cached. It shows your `no-internet` text and a retry button labelled `try-again`.

## The menu

The side menu is defined in the app, not the library, so it is the easiest thing to change in a fork:

| Item | Icon | Goes to | Shown when |
| --- | --- | --- | --- |
| `menu-overview` | list | `/stations/default` | always |
| `menu-selection` | keypad | `/selection` | always |
| `menu-language` | chat bubbles | `/language` | more than one language |
| `menu-share-app` | share | the device's share sheet | `share` is set **and** the device can share |

The labels are the texts with those keys, refreshed on every route change, so a language change reaches the menu too.

On tablets and desktops the menu becomes a permanent side pane, from Ionic's `md` breakpoint up.

## Pages the default app does not use

`@smartcompanion/ui` has thirteen pages; the default app routes to six. The others are there for an app that needs them:

| Page | What it does |
| --- | --- |
| `sc-page-tour-list` | A chooser showing each tour with its cover image and description |
| `sc-page-map` | Stations on a map, from their `latitude` and `longitude` |
| `sc-page-multi-audio-station` | A station with several audio tracks to choose from, and its images as a slideshow |
| `sc-page-station` | A single station on a page of its own |
| `sc-page-station-list` | A plain list of stations |
| `sc-page-tabbed-station-list` | The image list and the plain list as two tabs |
| `sc-page-station-image-list` | A station list laid out as images |

Using one is a route in your fork's `app-root.tsx`, plus a menu item that leads to it:

```tsx
<ion-route url="/tours" component="sc-page-tour-list" componentProps={{ facade: serviceFacade }} beforeEnter={() => serviceFacade.canLoadRoute()} />
```

Every page is in [Storybook](pathname:///storybook/) with its properties, and [UI components](../library/ui.md) describes them; [Routing](../library/routing.md) covers navigating between them.

### Map

`sc-page-map` renders with [MapLibre GL](https://maplibre.org/). It needs `mapBounds` — the area to show, as top-left and bottom-right latitude/longitude — and **exactly one** of:

- `mapStyleUrl` — a vector tile style URL
- `tileUrlTemplate` — a raster `{z}/{y}/{x}` URL template, which may point at tiles shipped with the app, e.g. `assets/map/{z}/{y}/{x}.jpeg`

```tsx
<ion-route
  url="/map"
  component="sc-page-map"
  componentProps={{ facade: serviceFacade, mapBounds: [47.585, 12.16, 47.58, 12.17], tileUrlTemplate: 'assets/map/{z}/{y}/{x}.jpeg' }}
  beforeEnter={() => serviceFacade.canLoadRoute()}
/>
```

Stations need `latitude` and `longitude`, and the `menu-map` text should be translated. Tiles from a tile server are requests to that server — worth knowing if your deployment is otherwise self-contained, and for offline use. See [UI components](../library/ui.md#maps).
