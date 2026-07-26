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
          // has loaded a track, which takes ~135ms locally but blows Vitest's
          // 1000ms default on a CI runner -- the suite passed or failed on the
          // same commit depending on runner load. Raising the ceiling only
          // extends how long a failing poll waits; a passing one still returns
          // on its first check.
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