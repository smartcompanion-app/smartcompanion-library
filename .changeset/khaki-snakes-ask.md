---
'@smartcompanion/ui': minor
---

Render `sc-page-map` with maplibre-gl instead of leaflet, so the map can now
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