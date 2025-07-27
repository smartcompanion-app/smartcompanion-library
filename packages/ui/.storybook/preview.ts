import { defineCustomElements } from '../loader';

import './style.css';

defineCustomElements();

const preview = {
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
