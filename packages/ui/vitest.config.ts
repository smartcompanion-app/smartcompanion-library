import { defineVitestConfig } from '@stencil/vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'snapshot',
          include: ['src/**/*.snapshot.{ts,tsx}'],
          environment: 'stencil',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
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
        test: {
          name: 'browser',
          include: ['src/**/*.browser.{ts,tsx}'],
          setupFiles: ['./vitest.setup.ts'],
          // These specs poll for state that lands only after the audio player
          // has loaded a track, which takes ~135ms locally but can blow Vitest's
          // 1000ms default on a loaded CI runner. Raising the ceiling only
          // extends how long a failing poll waits; a passing one still returns
          // on its first check. Note this is a headroom setting, not a fix for
          // lost player events -- the specs gate their clicks on the player
          // being initialized, see page-stations.browser.tsx.
          expect: { poll: { timeout: 10000 } },
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});