# @smartcompanion/ui

The web components behind the SmartCompanion audio-guide apps — built with [Stencil](https://stenciljs.com/), so they work in any framework or none. Five building-block components and thirteen ready-made pages, from the station list to the map.

Part of the [SmartCompanion Library](https://github.com/smartcompanion-app/smartcompanion-library) monorepo.

**[Browse the components in Storybook →](https://smartcompanion-app.github.io/smartcompanion-library/)**

## Install

```bash
npm install @smartcompanion/ui
```

Requires Node 20 or newer, and [`@smartcompanion/data`](https://www.npmjs.com/package/@smartcompanion/data) `>=0.9.0` as a peer. Pages are driven by a `ServiceFacade` from [`@smartcompanion/services`](https://www.npmjs.com/package/@smartcompanion/services).

## Usage

Importing the package registers every custom element:

```ts
import '@smartcompanion/ui';
```

Pages take the service facade as a prop:

```tsx
<sc-page-stations facade={serviceFacade} />
```

In a Stencil app that is typically passed via `componentProps` on the router route. `defineCustomElements` is also available from `@smartcompanion/ui/loader` if you need to control registration yourself.

## Components

Building blocks:

`sc-image-slideshow` · `sc-marquee` · `sc-numpad` · `sc-player-controls` · `sc-station-icon`

Pages:

`sc-page-error` · `sc-page-language` · `sc-page-loading` · `sc-page-map` · `sc-page-multi-audio-station` · `sc-page-pin` · `sc-page-selection` · `sc-page-station` · `sc-page-station-image-list` · `sc-page-station-list` · `sc-page-stations` · `sc-page-tabbed-station-list` · `sc-page-tour-list`

Props and events for each are documented in [Storybook](https://smartcompanion-app.github.io/smartcompanion-library/).

## Maps

`sc-page-map` renders with [MapLibre GL](https://maplibre.org/). Give it either `mapStyleUrl` for vector tiles or `tileUrlTemplate` for a raster `{z}/{y}/{x}` template — exactly one of the two is required.

## License

BSD-2-Clause. See [LICENSE](https://github.com/smartcompanion-app/smartcompanion-library/blob/main/LICENSE).
