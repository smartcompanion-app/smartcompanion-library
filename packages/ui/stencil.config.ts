import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

const isStorybook = !!process.env.STORYBOOK;

export const config: Config = {
  namespace: 'smartcompanion-ui',
  minifyJs: isStorybook ? false : undefined,
  minifyCss: isStorybook ? false : undefined,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
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
