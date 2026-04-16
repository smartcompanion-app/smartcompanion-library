# SmartCompanion Library

[![Build](https://github.com/smartcompanion-app/smartcompanion-library/actions/workflows/ci.yml/badge.svg)](https://github.com/smartcompanion-app/smartcompanion-library/actions/workflows/ci.yml)
![License](https://img.shields.io/github/license/smartcompanion-app/smartcompanion-library)
[![Storybook](https://img.shields.io/badge/Storybook-UI%20Components-ff4785)](https://smartcompanion-app.github.io/smartcompanion-library/)

## Table of Contents

- [Packages](#packages)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Local Development](#local-development)
- [License](#license)
- [Links](#links)

## Packages

| Package | Description |
| --- | --- |
| `@smartcompanion/ui` | Stencil v4 web components — `image-slideshow`, `marquee`, `numpad`, `player-controls`, `station-icon` |
| `@smartcompanion/data` | Domain models and data layer — assets, languages, pins, servers, stations, text, tours |
| `@smartcompanion/services` | Service layer — `AudioPlayerService`, `MenuService`, `RoutingService` |

## Prerequisites

- Node.js >= 14
- npm >= 7 (workspaces support)

## Getting Started

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

### apps/audioguide-app

The `apps/audioguide-app` workspace is a consumer application included in this monorepo. It is built on top of the packages above.

## License

The SmartCompanion Library Packages are licensed under the terms of the BSD 2-Clause license. Check the [LICENSE](LICENSE) text for further details.

## Links

- [Web site](https://www.smartcompanion.app)
- [Storybook](https://smartcompanion-app.github.io/smartcompanion-library/)
- [Native Audio Capacitor Plugin](https://github.com/smartcompanion-app/native-audio-player)
