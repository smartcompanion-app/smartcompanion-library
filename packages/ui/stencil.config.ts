import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

// maplibre-gl loads its worker from a file next to its own module, which is
// missing once the module is bundled into a Stencil chunk. The worker is
// copied from the installed maplibre-gl into sc-page-map's assets in the
// build output: `collection` is what a Stencil app compiles from, and its
// build copies the assets of every component it uses into `build/assets/`.
const maplibreWorker = require.resolve('maplibre-gl/dist/maplibre-gl-worker.mjs');

const isStorybook = !!process.env.STORYBOOK;

export const config: Config = {
  namespace: 'smartcompanion-ui',
  minifyJs: isStorybook ? false : undefined,
  minifyCss: isStorybook ? false : undefined,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      // Absolute destinations: a relative one is taken relative to each of the
      // target's outputs in turn. `ignore` is emptied, as the default one skips
      // anything under a dist/ directory.
      copy: [
        { src: maplibreWorker, dest: `${__dirname}/dist/collection/pages/page-map/assets/maplibre-gl-worker.mjs`, ignore: [] },
        { src: maplibreWorker, dest: `${__dirname}/dist/smartcompanion-ui/assets/maplibre-gl-worker.mjs`, ignore: [] },
      ],
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: true,
    },
    {
      type: 'docs-json',
      file: './custom-elements.json',
    },
  ],
  plugins: [
    sass()
  ]
};
