// Copies maplibre-gl's worker into sc-page-map's assets, from the maplibre-gl
// installed here, so the worker always matches the map code it talks to.
//
// From 6.11 maplibre loads its worker from a file next to its own module.
// Bundled into a Stencil chunk, that file is not there, and every map logs
// "Worker failed to load". sc-page-map ships the worker as a component asset
// instead, which Stencil copies into the app's build, and points maplibre at it.
import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(import.meta.resolve('maplibre-gl/dist/maplibre-gl-worker.mjs'));
const target = new URL('../src/pages/page-map/assets/', import.meta.url);

mkdirSync(target, { recursive: true });
copyFileSync(source, new URL('maplibre-gl-worker.mjs', target));
