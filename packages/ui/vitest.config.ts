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