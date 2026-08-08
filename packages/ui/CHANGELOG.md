# @smartcompanion/ui

## 1.0.0

### Major Changes

- [#94](https://github.com/smartcompanion-app/smartcompanion-library/pull/94) [`52ca6f2`](https://github.com/smartcompanion-app/smartcompanion-library/commit/52ca6f23697e8576483b775e5b8cb155ddd698e3) Thanks [@stefanhuber](https://github.com/stefanhuber)! - First stable release.

  The three packages have been usable together for a while; what changes here is
  the promise. From 1.0.0 the public surface is settled and semver applies to it:
  a breaking change needs a major, and the entry points a package exposes are the
  ones it will keep exposing.

  What that surface is, per package:

  - **`@smartcompanion/data`** — the domain services and their updaters, the
    `Storage` interface with its browser and in-memory implementations, and the
    online and offline load services.
  - **`@smartcompanion/services`** — `ServiceFacade` and its accessors, plus
    `AudioPlayerService`, `MenuService` and `RoutingService`.
  - **`@smartcompanion/ui`** — the custom elements, and the entry points named in
    the package's `exports` map: the root, `./loader`, and `./dist/collection/*`.
    Deep imports into anything else were never intended as API and no longer
    resolve.

  Two requirements moved in this release and need attention when upgrading from
  0.10.x:

  - **`@smartcompanion/native-audio-player` 1.0 is now required** by
    `@smartcompanion/services`. The plugin renamed its player event, which this
    package handles internally, but the peer range no longer accepts 0.5.x.
  - **`sc-page-map` renders with maplibre-gl 6.** The component's own props are
    unchanged; an app that pinned maplibre 5 itself will need to move.

  Nothing else about using these packages changes. Most of the work leading here
  went into things that leave no trace in the API — the entry points are declared
  rather than implied, every component has a rendering test, the packages carry
  READMEs, and one API removal that shipped undocumented in 0.10.0 is now on the
  record.

### Minor Changes

- [#90](https://github.com/smartcompanion-app/smartcompanion-library/pull/90) [`bbec13f`](https://github.com/smartcompanion-app/smartcompanion-library/commit/bbec13f3a404dbd2a1ea370f5b626afba8307816) Thanks [@stefanhuber](https://github.com/stefanhuber)! - Update the bundled map renderer to maplibre-gl 6. `sc-page-map` behaves
  exactly as before — same props, same markers, same attribution and the same
  disabled rotation — but apps that bundle this package now pull maplibre 6
  instead of 5.

  maplibre 6 removed its default export, so the component imports `Map`,
  `Marker` and `AttributionControl` by name. This is internal; nothing in the
  component's own API changes.

  The stylesheet is now imported as `~maplibre-gl/dist/maplibre-gl.css`, the same
  form the station list already uses for swiper, rather than by a relative path
  into the repository root's `node_modules`. npm places maplibre 6 under
  `packages/ui/node_modules` rather than hoisting it, which the hard-coded path
  could not follow.

- [#81](https://github.com/smartcompanion-app/smartcompanion-library/pull/81) [`4d42dd5`](https://github.com/smartcompanion-app/smartcompanion-library/commit/4d42dd59d812f1f8da3ff68f651d2b70f165ba86) Thanks [@stefanhuber](https://github.com/stefanhuber)! - Declare an `exports` map and `sideEffects` on `@smartcompanion/ui`, so the
  package states which entry points it supports instead of exposing every file it
  happens to ship. Two are public: the root, and `@smartcompanion/ui/loader` for
  `defineCustomElements`. Everything else — `dist/` internals and the bundled
  `src/` — is now closed.

  Nothing about the supported entry points changes: the root still resolves to the
  CommonJS build under Node and the ES module build under a bundler, exactly as
  `main` and `module` did before. Only paths that were never intended as API stop
  resolving, so an import reaching into `dist/` or `src/` directly needs to move
  to the root export.

  This is deliberately landing before 1.0. Adding an `exports` map to a package
  that already has one is a breaking change, so the window for doing it quietly
  closes at the first stable release.

### Patch Changes

- [#84](https://github.com/smartcompanion-app/smartcompanion-library/pull/84) [`69d718a`](https://github.com/smartcompanion-app/smartcompanion-library/commit/69d718a81cad89a98440673b2193e2c5b2b36e77) Thanks [@stefanhuber](https://github.com/stefanhuber)! - Add a README to each package, and the `description`, `keywords`, `homepage`
  and `bugs` fields npm renders alongside it. `services` and `ui` had no README
  at all, so their npm pages showed nothing about what the package is or how to
  install it, and none of the three declared a description.

- [#89](https://github.com/smartcompanion-app/smartcompanion-library/pull/89) [`21cd3bb`](https://github.com/smartcompanion-app/smartcompanion-library/commit/21cd3bb14097df2e4d4fb3c0d105ec35b14770f8) Thanks [@stefanhuber](https://github.com/stefanhuber)! - Update the bundled swiper to 14.1.0, a minor release with no API or markup
  changes. The station list and the image slideshow behave exactly as before.

## 0.10.0

### Minor Changes

- [#78](https://github.com/smartcompanion-app/smartcompanion-library/pull/78) [`4ca77a5`](https://github.com/smartcompanion-app/smartcompanion-library/commit/4ca77a59f1b1ec5fcb5aea42fab0f3b0e049545b) Thanks [@muhammadrafayasif](https://github.com/muhammadrafayasif)! - Render `sc-page-map` with maplibre-gl instead of leaflet, so the map can now
  draw vector tiles. Point the new `mapStyleUrl` prop at a style document to use
  one; `tileUrlTemplate` still takes a raster `{z}/{y}/{x}` template and behaves
  as before. Exactly one of the two must be set. Panning, zoom limits and
  attribution are unchanged, and rotation and pitch — which maplibre enables by
  default and leaflet had no concept of — are switched off, so the map handles
  the way it did before.

  Three things need attention when upgrading:

  - Station markers now carry the class `station-map-marker` instead of
    `station-map-icon`. Any app styling the old class must rename its selector;
    nothing warns if it doesn't.
  - Markers are anchored at their bottom edge rather than their centre, so a pin
    sits slightly higher relative to its coordinate. Custom marker CSS may need
    its offset adjusted.
  - `facade` and `mapBounds` are now typed as required in JSX. They were always
    needed at runtime, but TypeScript consumers who omitted them previously
    compiled and will now get an error.

  The map renderer is markedly heavier than leaflet — roughly 1 MB of JavaScript
  plus 70 KB of CSS, against leaflet's ~150 KB. That cost applies to every app
  bundling `sc-page-map`, including those that only ever show raster tiles.

### Patch Changes

- [#72](https://github.com/smartcompanion-app/smartcompanion-library/pull/72) [`376fd33`](https://github.com/smartcompanion-app/smartcompanion-library/commit/376fd336999f7ad90d1f592266cecfdae547e0bb) Thanks [@dependabot](https://github.com/apps/dependabot)! - Satisfy the rules newly enabled by `@stencil/eslint-plugin` 1.4.0, whose recommended preset grew from 12 to 24 rules. `@Element()` fields are now typed as their generated element interface (`HTMLScMarqueeElement` and friends) rather than plain `HTMLElement`, and the page components return a single `<Host>` instead of an array of children. Neither changes the rendered DOM.

- [#64](https://github.com/smartcompanion-app/smartcompanion-library/pull/64) [`1308858`](https://github.com/smartcompanion-app/smartcompanion-library/commit/13088588a7c9602fc82690ab9148aec566146b05) Thanks [@stefanhuber](https://github.com/stefanhuber)! - Declare `engines.node: >=20` and `publishConfig.access` on all three packages, and correct the repository URL to the `git+https://` form npm expects. The `@smartcompanion/data` peer range in `services` and `ui` is now a `>=0.9.0` floor rather than a caret, so lockstep releases bump as minors instead of escalating to majors.

- [#71](https://github.com/smartcompanion-app/smartcompanion-library/pull/71) [`4c7d5a8`](https://github.com/smartcompanion-app/smartcompanion-library/commit/4c7d5a84b0e4ec8b548f696b831c77c6b11d0d9f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update the bundled swiper to v14. The station list and the image slideshow render and behave exactly as before — v14 is a TypeScript rewrite of v12 with no API, option, or markup changes — but it raises the browser baseline to Chrome/Edge 110+, Safari 16.4+ (iOS 16.4+) and Firefox 110+. Consumers that still support older browsers should stay on the previous release.
