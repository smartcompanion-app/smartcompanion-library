import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const org = 'https://github.com/smartcompanion-app';
const repo = `${org}/smartcompanion-library`;

const config: Config = {
  title: 'SmartCompanion Docs',
  tagline: 'A free, open-source audioguide for museums, tourism and cultural institutions',
  favicon: 'img/favicon.ico',

  // Served at the root of its own domain. static/CNAME keeps the domain attached
  // across deploys, and Storybook is copied in under /storybook/ by pages.yml.
  url: 'https://docs.smartcompanion.app',
  baseUrl: '/',
  organizationName: 'smartcompanion-app',
  projectName: 'smartcompanion-library',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    // .md files are parsed as CommonMark rather than MDX, so a `<` or `{` in
    // prose stays text instead of becoming JSX. A page that needs MDX -- tabs,
    // say -- is written as .mdx.
    format: 'detect',
    mermaid: true,
    hooks: { onBrokenMarkdownLinks: 'throw' },
  },

  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: `${repo}/edit/main/packages/docs/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'SmartCompanion',
      logo: {
        alt: 'SmartCompanion',
        src: 'img/logo.png',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'guide', position: 'left', label: 'Audioguide' },
        { type: 'docSidebar', sidebarId: 'library', position: 'left', label: 'Library' },
        // pathname:// leaves the link to the browser: Storybook is not a page of this site.
        { href: 'pathname:///storybook/', label: 'Storybook', position: 'left' },
        { href: 'https://www.smartcompanion.app/', label: 'Website', position: 'right' },
        { href: org, label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Quickstart', to: '/quickstart' },
            { label: 'Content', to: '/content' },
            { label: 'Library', to: '/library' },
          ],
        },
        {
          title: 'Projects',
          items: [
            { label: 'Audioguide app', href: `${org}/audioguide-app` },
            { label: 'Library', href: repo },
            { label: 'Data format', href: `${org}/data-format` },
            { label: 'Native audio player', href: `${org}/native-audio-player` },
            { label: 'engraft', href: `${org}/engraft` },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Discussions', href: 'https://github.com/orgs/smartcompanion-app/discussions' },
            { label: 'Contributing', href: `${repo}/blob/main/CONTRIBUTING.md` },
            { label: 'Security', href: `${repo}/blob/main/SECURITY.md` },
          ],
        },
      ],
      copyright: `BSD 2-Clause · <a href="https://www.smartcompanion.app/">SmartCompanion</a> · <a href="https://www.smartcompanion.app/impressum/">Impressum</a> · <a href="https://www.smartcompanion.app/datenschutz/">Datenschutz</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'diff', 'json', 'yaml', 'toml', 'nginx', 'apacheconf'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
