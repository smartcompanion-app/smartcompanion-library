import { Preview, setCustomElementsManifest } from '@stencil/storybook-plugin';
import { within as withinShadow } from 'shadow-dom-testing-library';
import customElements from '../custom-elements.json';
import './style.css';

setCustomElementsManifest(customElements);

const preview: Preview = {

  beforeEach({ canvasElement, canvas }) {
    Object.assign(canvas, { ...withinShadow(canvasElement) });
  },

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

export type ShadowQueries = ReturnType<typeof withinShadow>;

declare module 'storybook/internal/csf' {
  interface Canvas extends ShadowQueries {}
}

export default preview;
