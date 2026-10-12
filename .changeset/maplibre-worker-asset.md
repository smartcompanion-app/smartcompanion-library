---
'@smartcompanion/ui': patch
---

Update maplibre-gl to 6.14.0 and ship its worker with `sc-page-map`. From 6.11
maplibre loads the worker from a file next to its own module, which a Stencil
build does not have, so every map logged "Worker failed to load". The worker
now comes along as a component asset that Stencil copies into the app's build,
and the map points maplibre at it -- no change needed in the apps.

maplibre-gl is pinned to an exact version, so the map code an app bundles is
always the version its worker was copied from.

An app with a service worker that should show the map offline has to precache
the worker too: it is `build/assets/maplibre-gl-worker.mjs`, which a glob like
`**/*.{js,css,...}` does not match.
