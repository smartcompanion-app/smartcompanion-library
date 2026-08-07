# SmartCompanion Library

[![Build](https://github.com/smartcompanion-app/smartcompanion-library/actions/workflows/ci.yml/badge.svg)](https://github.com/smartcompanion-app/smartcompanion-library/actions/workflows/ci.yml)
![License](https://img.shields.io/github/license/smartcompanion-app/smartcompanion-library)
[![Storybook](https://img.shields.io/badge/Storybook-UI%20Components-ff4785)](https://smartcompanion-app.github.io/smartcompanion-library/)

The building blocks behind the SmartCompanion audio-guide apps: the data layer, the services that drive it, and the web components users actually see. Published as three npm packages, versioned in lockstep.

## Table of Contents

- [Packages](#packages)
- [Using the Packages](#using-the-packages)
- [Getting Started](#getting-started)
- [Local Development](#local-development)
- [Contributing](#contributing)
- [Releasing](#releasing)
- [License](#license)
- [Links](#links)

## Packages

| Package | Description |
| --- | --- |
| [`@smartcompanion/ui`](https://www.npmjs.com/package/@smartcompanion/ui) [![npm](https://img.shields.io/npm/v/@smartcompanion/ui)](https://www.npmjs.com/package/@smartcompanion/ui) | Stencil v4 web components — five building blocks (`sc-image-slideshow`, `sc-marquee`, `sc-numpad`, `sc-player-controls`, `sc-station-icon`) and thirteen ready-made `sc-page-*` pages |
| [`@smartcompanion/data`](https://www.npmjs.com/package/@smartcompanion/data) [![npm](https://img.shields.io/npm/v/@smartcompanion/data)](https://www.npmjs.com/package/@smartcompanion/data) | Domain models and data layer — assets, languages, pins, servers, stations, text, tours, plus storage, loading and updates |
| [`@smartcompanion/services`](https://www.npmjs.com/package/@smartcompanion/services) [![npm](https://img.shields.io/npm/v/@smartcompanion/services)](https://www.npmjs.com/package/@smartcompanion/services) | Service layer — `ServiceFacade` over the data layer, plus `AudioPlayerService`, `MenuService`, `RoutingService` |

Each package has its own README with installation details and usage: [ui](packages/ui/README.md) · [data](packages/data/README.md) · [services](packages/services/README.md).

## Using the Packages

Building an app *with* the library, rather than working on the library itself:

```bash
npm install @smartcompanion/ui @smartcompanion/services @smartcompanion/data
```

Importing `@smartcompanion/ui` registers every custom element; pages take a `ServiceFacade` as their `facade` prop.

```ts
import '@smartcompanion/ui';
import { ServiceFacade } from '@smartcompanion/services';

const facade = new ServiceFacade();
facade.registerCollectibleAudioPlayerService('My Audio Guide');
facade.registerOnlineLoadService(() => fetch('/data.json').then(r => r.json()));
```

```tsx
<sc-page-stations facade={facade} />
```

Two constraints worth knowing before you start:

- **Node 20 or newer**, and `@smartcompanion/services` expects `@capacitor/core`, `@ionic/core` and `@smartcompanion/native-audio-player` as peers alongside `@smartcompanion/data`.
- **`data` and `services` are ESM-only.** They declare `"type": "module"` and ship an `exports` map, so `import` works from Node and from bundlers, but `require()` is not supported. `ui` is unaffected — Stencil emits its own CommonJS, ESM and custom-elements builds.

The [audioguide app](https://github.com/smartcompanion-app/audioguide-app) is a complete worked example.

## Getting Started

Working on the library itself:

```bash
npm install        # Install all workspace dependencies
npm run build      # Build all packages
npm test           # Run tests for all packages
```

## Local Development

### @smartcompanion/data

```bash
npm run build -w packages/data    # Compile TypeScript to dist/
npm run test -w packages/data     # Run Vitest tests
npm run lint -w packages/data     # Lint source files
npm run format -w packages/data   # Format source files with Prettier
```

### @smartcompanion/services

```bash
npm run build -w packages/services    # Compile TypeScript to dist/
npm run test -w packages/services     # Run Vitest tests
npm run lint -w packages/services     # Lint source files
npm run format -w packages/services   # Format source files with Prettier
```

### @smartcompanion/ui

UI components are developed in isolation with [Storybook](https://storybook.js.org/).

```bash
npm run build -w packages/ui       # Compile Stencil components
npm run test -w packages/ui        # Run Vitest and Playwright browser tests
npm run watch -w packages/ui       # Stencil watch mode
npm run storybook -w packages/ui   # Dev server at http://localhost:6006
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the local setup, the test layout, and the package boundaries enforced by `npm run depcruise`. Security issues go through [SECURITY.md](SECURITY.md), not the issue tracker.

## Releasing

Releases are driven by [changesets](https://github.com/changesets/changesets):

```bash
npm run changeset   # describe your change; commit the generated file
```

Merging to `main` opens a `chore: release` pull request with the version bumps and changelogs. Merging *that* publishes all three packages — versioned in lockstep — to npm via [trusted publishing](https://docs.npmjs.com/trusted-publishers), with provenance and no stored npm token.

## License

The SmartCompanion Library Packages are licensed under the terms of the BSD 2-Clause license. Check the [LICENSE](LICENSE) text for further details.

## Links

- [Web site](https://www.smartcompanion.app)
- [Storybook](https://smartcompanion-app.github.io/smartcompanion-library/)
- [SmartCompanion Audioguide App](https://github.com/smartcompanion-app/audioguide-app)
- [Native Audio Capacitor Plugin](https://github.com/smartcompanion-app/native-audio-player)
