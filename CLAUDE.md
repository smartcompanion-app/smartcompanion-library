# SmartCompanion Library

## Project Overview

TypeScript monorepo with npm workspaces containing reusable packages for SmartCompanion applications.

**Packages:**
- `@smartcompanion/data` — Domain models and data layer (assets, languages, pins, servers, stations, text, tours)
- `@smartcompanion/services` — Service layer (AudioPlayerService, MenuService, RoutingService)
- `@smartcompanion/ui` — Stencil web components (image-slideshow, marquee, numpad, player-controls, station-icon)

**Apps:**
- `apps/audioguide-app` — Consumer application workspace member built on top of the packages above

## Git

- Main branch: `main`
- Releases triggered by tags matching `v[0-9]+.[0-9]+.[0-9]+`
- Follows [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)

## Commands

### Root (all packages)
```bash
npm install        # Install all workspace dependencies
npm run build      # Build all packages
npm test           # Run tests for all packages
```

### Per package (use `-w packages/<name>`)
```bash
npm run build -w packages/data
npm run test -w packages/data
npm run lint -w packages/data
npm run format -w packages/data

npm run build -w packages/services
npm run test -w packages/services
npm run lint -w packages/services
npm run format -w packages/services

npm run build -w packages/ui
npm run test -w packages/ui
npm run watch -w packages/ui         # Stencil watch mode
npm run storybook -w packages/ui     # Dev server at http://localhost:6006
```

## Architecture

- **Data & Services**: TypeScript compiled with `tsc`, output to `dist/`
- **UI**: Stencil v4 web components compiled to CJS, ESM, and custom-elements distributions
- **Testing**: Jest + ts-jest across all packages; Playwright for UI component tests via Storybook
- **Pattern**: Domain-driven (data), Service/Facade (services), Web Components (ui)

## Code Style

- Prettier: single quotes, 2-space indent, print width 180, trailing commas
- EditorConfig: LF line endings, UTF-8, 2-space indent
- TypeScript: strict mode (`noImplicitAny`), ES modules
- File names: kebab-case; Classes/Interfaces: PascalCase

## CI/CD

- CI runs on all PRs/pushes: install → build → test (Ubuntu 24.04, Node 20)
- Release publishes to NPM on version tags; requires `NPM_TOKEN` secret
- Version is set across all packages simultaneously during release