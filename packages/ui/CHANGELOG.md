# @smartcompanion/ui

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
