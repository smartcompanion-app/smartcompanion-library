# SmartCompanion Library

## Project Overview

TypeScript monorepo with npm workspaces containing reusable packages for SmartCompanion applications.

**Packages:**
- `@smartcompanion/data` — Domain models and data layer (assets, languages, pins, servers, stations, text, tours)
- `@smartcompanion/services` — Service layer (AudioPlayerService, MenuService, RoutingService)
- `@smartcompanion/ui` — Stencil web components (image-slideshow, marquee, numpad, player-controls, station-icon)

## Git

- Main branch: `main`
- Follows [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- `npm install` installs a husky pre-commit hook that runs Prettier over staged files under `packages/*/src`

## Releasing

Driven by [changesets](https://github.com/changesets/changesets), not by tags — pushing a `vX.Y.Z` tag does nothing.

1. Any change to published behaviour ships with a changeset (`npm run changeset`), committed alongside it. All three packages are versioned in lockstep (`fixed` in `.changeset/config.json`), so one changeset bumps all three.

   The peer range on `@smartcompanion/data` in `services` and `ui` is `^1.0.0`. Changesets escalates a peer *dependent* to a major bump whenever the new dependency version falls outside its declared range. On 0.x that made a caret unusable — `^0.9.x` excludes `0.10.0`, so every release came out a major, and the range was a `>=0.9.0` floor to avoid it. From 1.0.0 onward a caret is the right form: minors stay in range, and only a 2.0.0 escalates, which is what should happen when all three go major together. Keep the caret.

2. Merging to `main` opens a `chore: release` PR with the version bumps and changelogs.
3. Merging that PR publishes to npm over trusted publishing (OIDC) with provenance. No npm token exists in this repo.

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
- **Testing**: Vitest across all packages; Playwright for UI browser tests via @vitest/browser-playwright
- **Pattern**: Domain-driven (data), Service/Facade (services), Web Components (ui)

## Code Style

- Prettier: single quotes, 2-space indent, print width 180, trailing commas
- EditorConfig: LF line endings, UTF-8, 2-space indent
- TypeScript: strict mode (`noImplicitAny`), ES modules
- File names: kebab-case; Classes/Interfaces: PascalCase

## Quality Gates

Every change must pass these before committing:
```bash
npm run lint           # Lint all packages (must pass with 0 errors, 0 warnings)
npm run format:check   # Prettier check across all packages
npm run depcruise      # Package boundaries (see .dependency-cruiser.json)
npm test               # Run tests for all packages
npm run check:publish  # publint + attw against each package's tarball
```

## CI/CD

- `ci.yml` runs on PRs and pushes to `main` (Ubuntu 24.04, Node 22), in two parallel jobs:
  - `lint` — lint, format:check, depcruise
  - `test` — build, test (Playwright/Chromium), check:publish
- `release.yml` runs on pushes to `main` and drives the changesets flow described above
- `pages.yml` deploys Storybook to GitHub Pages on every push to `main`

## Module Format

`@smartcompanion/data` and `@smartcompanion/services` are **ESM-only**: `"type": "module"`, `module`/`moduleResolution` set to `nodenext`, and an `exports` map. Consequences to keep in mind when editing them:

- Relative imports need explicit extensions — `'./updater.js'`, `'./update/index.js'`. Extensionless or directory specifiers compile but produce output Node cannot load.
- The `.js` extension refers to the *emitted* file; the source is still `.ts`. This is normal NodeNext, not a mistake.
- `require()` of these packages fails by design. Their `check:publish` passes `--ignore-rules cjs-resolves-to-esm` to attw for exactly this reason — do not "fix" that warning by reverting to CJS.

`@smartcompanion/ui` is unaffected: Stencil produces its own CJS/ESM/custom-elements outputs.

### The `exports` map on `@smartcompanion/ui`

Public entry points: the root, `./loader`, and `./dist/collection/*`. Adding an `exports` map to a package that already has one is breaking, so this landed before 1.0 deliberately. Three details there look wrong and are not:

- The `node` condition is listed **before** `import` and points at the CommonJS build. Stencil emits its ESM as `.js` inside a package that is not `"type": "module"`, and produces no `.mjs`, so Node's ESM loader cannot parse those files — resolving Node's `import` to `dist/index.js` yields *"Unexpected module syntax"*. `node` therefore captures both of Node's modes and hands them CJS, exactly what `main` did before, while bundlers skip `node`, match `import`, and get the real ESM. Do not remove the `node` condition.
- `./dist/collection/*` is exposed because that is how a **Stencil app actually consumes this package**. The `collection` field points there, and the compiler builds components from that source rather than from the JS entry — verified against audioguide-app, whose bundle contains no trace of `dist/index.js`. Stencil currently reads those files by path, so `exports` does not gate them today, but declaring them keeps the real consumption path from breaking if that ever changes.
- `check:publish` passes `--ignore-rules named-exports` to attw. `loader/index.cjs.js` is a bare re-export, so `cjs-module-lexer` cannot statically see `defineCustomElements`, and attw flags the subpath. This is a pre-existing limit of Stencil's loader output that the `exports` map merely made visible — the subpath was unusable from Node ESM before too.
