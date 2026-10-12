// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const config = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [],
  framework: {
    name: getAbsolutePath("@stencil/storybook-plugin")
  },
  // maplibre-gl's dist, which holds the map's worker, at the asset path
  // preview.ts sets (see the copy task in stencil.config.ts)
  staticDirs: ["./public", { from: dirname(require.resolve("maplibre-gl/dist/maplibre-gl-worker.mjs")), to: "/page-map/assets" }],
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
