import { Preview, setCustomElementsManifest } from '@stencil/storybook-plugin';
import { setAssetPath } from '@stencil/core';
import customElements from '../custom-elements.json';
import './style.css';

setCustomElementsManifest(customElements);

// Where getAssetPath() resolves component assets -- sc-page-map's worker, which
// main.ts serves from page-map/assets. Relative to the page, as GitHub Pages
// serves Storybook from a subpath.
setAssetPath(new URL('page-map/', document.baseURI).href);

const preview: Preview = {

  globalTypes: {
    theme: {
      description: 'Color theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      document.documentElement.classList.toggle('ion-palette-dark', context.globals.theme === 'dark');
      return Story();
    },
  ],

  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        "mobile-sm": {
          name: 'Mobile Small',
          styles: {
            width: '320px',
            height: '568px',
          },
          type: 'mobile',
        }
      }
    }
  },

  initialGlobals: {
    viewport: { value: 'mobile-sm', isRotated: false },
  },
};

export default preview;
