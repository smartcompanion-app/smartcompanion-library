import { Preview, setCustomElementsManifest } from '@stencil/storybook-plugin';
import customElements from '../custom-elements.json';
import './style.css';

setCustomElementsManifest(customElements);

const preview: Preview = {

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
