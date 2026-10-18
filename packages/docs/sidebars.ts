import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// Listed by hand, in reading order, so ordering does not live in front matter.
// Two sidebars: running an audioguide, and building on the library.
const sidebars: SidebarsConfig = {
  guide: [
    { type: 'doc', id: 'index', label: 'Introduction' },
    'quickstart',
    {
      type: 'category',
      label: 'Content',
      link: { type: 'doc', id: 'content/index' },
      items: ['content/data-format', 'content/stations', 'content/tours', 'content/languages', 'content/ui-texts', 'content/media', 'content/access-and-sharing'],
    },
    {
      type: 'category',
      label: 'Customization',
      link: { type: 'doc', id: 'customization/index' },
      items: ['customization/variables', 'customization/colors', 'customization/logos-and-icons', 'customization/variants'],
    },
    {
      type: 'category',
      label: 'Features',
      link: { type: 'doc', id: 'features/index' },
      items: ['features/screens', 'features/audio', 'features/offline', 'features/pwa', 'features/embedding'],
    },
    {
      type: 'category',
      label: 'Deployment',
      link: { type: 'doc', id: 'deployment/index' },
      items: ['deployment/github-pages', 'deployment/netlify', 'deployment/self-hosting', 'deployment/managed'],
    },
    {
      type: 'category',
      label: 'Reference',
      link: { type: 'doc', id: 'reference/index' },
      items: ['reference/architecture', 'reference/configuration', 'reference/scripts', 'reference/browser-support', 'reference/versioning', 'reference/troubleshooting'],
    },
  ],
  library: [
    { type: 'doc', id: 'library/index', label: 'Overview' },
    'library/getting-started',
    'library/data',
    'library/services',
    'library/routing',
    'library/ui',
    'library/development',
  ],
};

export default sidebars;
