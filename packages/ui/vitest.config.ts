import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineVitestConfig } from '@stencil/vitest/config';
import { playwright } from '@vitest/browser-playwright';
import type { Plugin } from 'vite';

// The specs run against the lazy build in dist, so coverage reaches src only
// through that build's source maps (emitted by the --dev build stencil-test
// does). Stencil writes their `sources` relative to the package root, but a map
// is read relative to its own directory, so they resolve into dist, to files
// that do not exist, and every component drops out of the report. This loads
// the build with its sources made absolute.
const lazyBuild = resolve(__dirname, 'dist/smartcompanion-ui');
const lazyBuildSourceMaps = (): Plugin => ({
  name: 'lazy-build-source-maps',
  load(id) {
    const file = id.split('?')[0];
    if (!file.startsWith(`${lazyBuild}/`) || !file.endsWith('.js') || !existsSync(`${file}.map`)) {
      return null;
    }
    const map = JSON.parse(readFileSync(`${file}.map`, 'utf8'));
    map.sources = map.sources.map((source: string) => resolve(__dirname, source));
    return { code: readFileSync(file, 'utf8'), map };
  },
});

// A function rather than a shared object: Vitest names the browser instances in
// place, and two projects sharing one instance collide on that name.
const browser = () => ({
  enabled: true,
  provider: playwright(),
  headless: true,
  screenshotFailures: false,
  instances: [{ browser: 'chromium' as const }],
});

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    coverage: {
      provider: 'v8',
      // The lazy build is included only to be remapped to src; what it bundles
      // from node_modules is dropped after the remap.
      include: ['src/**/*.{ts,tsx}', 'dist/smartcompanion-ui/*.js'],
      exclude: ['src/**/*.{test,spec,snapshot,browser,stories}.{ts,tsx}', 'src/components.d.ts', 'dist/smartcompanion-ui/index.esm.js', '**/node_modules/**'],
      excludeAfterRemap: true,
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          environment: 'node',
        },
      },
      {
        plugins: [lazyBuildSourceMaps()],
        test: {
          name: 'snapshot',
          include: ['src/**/*.snapshot.{ts,tsx}'],
          environment: 'stencil',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        plugins: [lazyBuildSourceMaps()],
        test: {
          name: 'spec',
          include: ['src/**/*.spec.{ts,tsx}'],
          environment: 'stencil',
          setupFiles: ['./vitest.setup.ts'],
          environmentOptions: {
            stencil: {
              domEnvironment: 'jsdom',
            },
          },
        },
      },
      {
        plugins: [lazyBuildSourceMaps()],
        test: {
          name: 'browser',
          include: ['src/**/*.browser.{ts,tsx}'],
          exclude: ['src/**/*.ionic.browser.{ts,tsx}'],
          setupFiles: ['./vitest.setup.ts'],
          // These specs poll for state that lands only after the audio player
          // has loaded a track, which takes ~135ms locally but can blow Vitest's
          // 1000ms default on a loaded CI runner. Raising the ceiling only
          // extends how long a failing poll waits; a passing one still returns
          // on its first check. Note this is a headroom setting, not a fix for
          // lost player events -- the specs gate their clicks on the player
          // being initialized, see page-stations.browser.tsx.
          expect: { poll: { timeout: 10000 } },
          browser: browser(),
        },
      },
      {
        plugins: [lazyBuildSourceMaps()],
        // Browser specs against a real Ionic, loaded by vitest.setup.ionic.ts
        // so that no file under src imports @ionic/core -- see there.
        test: {
          name: 'browser-ionic',
          include: ['src/**/*.ionic.browser.{ts,tsx}'],
          setupFiles: ['./vitest.setup.ts', './vitest.setup.ionic.ts'],
          expect: { poll: { timeout: 10000 } },
          browser: browser(),
        },
      },
    ],
  },
});