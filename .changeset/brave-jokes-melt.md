---
'@smartcompanion/ui': minor
---

Update the bundled map renderer to maplibre-gl 6. `sc-page-map` behaves
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
