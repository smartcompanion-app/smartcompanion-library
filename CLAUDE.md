# SmartCompanion Library

## Project Overview

TypeScript monorepo with npm workspaces containing reusable packages for SmartCompanion applications.

**Packages:**
- `@smartcompanion/data` — Domain models and data layer (assets, languages, pins, servers, stations, text, tours)
- `@smartcompanion/services` — Service layer (AudioPlayerService, MenuService, RoutingService)
- `@smartcompanion/ui` — Stencil web components (image-slideshow, marquee, numpad, player-controls, station-icon)
- `packages/docs` (`smartcompanion-docs`, private) — the Docusaurus site at https://docs.smartcompanion.app, see [Documentation site](#documentation-site)

## Git

- Main branch: `main`
- Follows [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- `npm install` installs a husky pre-commit hook that runs Prettier over staged files under `packages/*/src`

## Releasing

Driven by [changesets](https://github.com/changesets/changesets), not by tags — pushing a `vX.Y.Z` tag does nothing.

1. Any change to published behaviour ships with a changeset (`npm run changeset`), committed alongside it. All three packages are versioned in lockstep (`fixed` in `.changeset/config.json`), so one changeset bumps all three.

   The peer range on `@smartcompanion/data` in `services` and `ui` is a caret on the current major (`^2.0.0`). Changesets escalates a peer *dependent* to a major bump whenever the new dependency version falls outside its declared range. On 0.x that made a caret unusable — `^0.9.x` excludes `0.10.0`, so every release came out a major, and the range was a `>=0.9.0` floor to avoid it. From 1.0.0 onward a caret is the right form: minors stay in range, and only a 2.0.0 escalates, which is what should happen when all three go major together. Keep the caret.

2. Merging to `main` opens a `chore: release` PR with the version bumps and changelogs.
3. Merging that PR publishes to npm over trusted publishing (OIDC) with provenance. No npm token exists in this repo.

## Commands

### Root (all packages)
```bash
npm install        # Install all workspace dependencies
npm run build      # Build all packages
npm test           # Run tests for all packages
npm run coverage   # Run tests with v8 coverage; reports in packages/*/coverage
npm run docs:start # Docs site with live reload
npm run docs:build # Docs site → packages/docs/build; fails on a broken link or anchor
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
npm run coverage -w packages/ui      # Tests with coverage (any package)
npm run watch -w packages/ui         # Stencil watch mode
npm run storybook -w packages/ui     # Dev server at http://localhost:6006
```

## Architecture

- **Data & Services**: TypeScript compiled with `tsc`, output to `dist/`
- **UI**: Stencil v4 web components compiled to CJS, ESM, and custom-elements distributions
- **Testing**: Vitest across all packages; Playwright for UI browser tests via @vitest/browser-playwright
- **Pattern**: Domain-driven (data), Service/Facade (services), Web Components (ui)

### Coverage

Report only, no thresholds. CI runs `npm run coverage` in place of `npm test`, writes a table to the job summary (`scripts/coverage-summary.mjs`) and uploads the HTML reports as the `coverage` artifact.

`ui` tests run against the lazy build in `dist`, not `src`, so its coverage is that build remapped through the source maps Stencil emits for the `--dev` build `stencil-test` does. Run it through the `coverage` script (`stencil-test --coverage`): plain `vitest` would run against whatever build is in `dist`, and a production build has no maps. Stencil writes the maps' `sources` relative to the package root, which breaks the remap; the `lazyBuildSourceMaps` plugin in `vitest.config.ts` corrects them on load. `coverage.include` therefore lists `dist/smartcompanion-ui/*.js`, and `excludeAfterRemap` drops whatever that build bundles from `node_modules`.

### Routing

Apps render pages into `ion-router-outlet`. Ionic 9 removed `ion-router` driving `ion-nav` — that setup now renders an empty page — so `RoutingService` keeps no stack of its own: the stack is the browser history. `push()` adds an entry, `replace()` overwrites it, `back()` steps back or goes to a fallback, and `canGoBack()` tracks how far back the app's own entries reach. Back buttons use `ion-back-button` with `default-href="#"`: Ionic shows a back button only if it has an `ion-nav` or a `default-href`, and ignores hrefs that start with `#`, so the click is left to the page's `handleBack`.

`MenuService` and `RoutingService` talk to Ionic's elements (`ion-menu`, `ion-router`), never to its JS exports. A Stencil app compiles Ionic's components from `@ionic/core/dist/collection`, but Ionic 9's `exports` map resolves `import { menuController } from '@ionic/core'` to its standalone build — a second controller no menu registers with. `services` imports Ionic for types only.

`src/pages/routing.ionic.browser.tsx` tests this against a real Ionic, loaded by `vitest.setup.ionic.ts` for `*.ionic.browser.tsx` specs only. **Nothing under `packages/ui/src` may import `@ionic/core`, tests included**: Stencil compiles every file there and treats an imported component collection as part of this library, which bundles all of Ionic into the `ui` build. The `ui-src-no-ionic` rule in `.dependency-cruiser.json` enforces this.

### Audio pages mixin

`sc-page-stations`, `sc-page-station` and `sc-page-multi-audio-station` share their player state and logic through the Stencil mixin `audioPlayerComponent` (`src/utils/audio-player-component.ts`): `extends Mixin(audioPlayerComponent)`, and the page overrides `onAudioIndexChange`/`onSkip`/`onCompleted`/`onCollected`. Several details there look wrong and are not:

- A consuming Stencil app needs **Stencil 4.44 or later**, and so does the build of this library. From 4.44 a collection lists its mixins in `collection-manifest.json`; without that list, 4.39 and later compile the pages without the mixin's `@State`s and the app's `facade` prop, silently — the app builds and the pages render blank. That is why `@stencil/core >=4.44.0` is an optional peer of `ui`. 4.38 and older failed differently (stenciljs/core#6410).
- Pages import the mixin from its own file, never through `utils/index.ts`: an app compiling the collection from `node_modules` resolves a mixin only through the module that defines it.
- The factory is typed `<B extends MixedInCtor>(Base: B) => …`. Annotated as `MixinFactory`, its members vanish from the page's type.
- Every mixin member is public: TS cannot emit declarations for an exported class expression with private or protected members (TS4094). The page's overrides are public too, each with an `eslint-disable-next-line stencil/own-methods-must-be-private`.
- The mixin declares no `facade`: each page declares `@Prop() facade` with its own facade type, which a field in the mixin would overwrite (TS2612), so the mixin reads it through `audioPlayerFacade`.

### Map worker

maplibre-gl (from 6.11) loads its worker from a file next to its own module. Bundled into a Stencil chunk that file is missing, and every map logs *"Worker failed to load"*. `sc-page-map` therefore ships the worker as a component asset (`assetsDirs`), which Stencil copies into a consuming app's `build/assets/`, and points `setWorkerUrl()` at it. The file never enters `src/`: a `copy` task on the `dist` output target in `stencil.config.ts` copies it from the installed maplibre-gl into `dist/collection/pages/page-map/assets/` (and the lazy build's `assets/`), and Storybook serves maplibre-gl's `dist` as a static dir. `assetsDirs: ['assets']` still has to be declared on the component even though `src` has no such folder — it is what makes a consuming app copy the folder from the collection. maplibre-gl is pinned to an **exact** version so the app bundles the same map code the shipped worker was copied from — keep it exact when bumping.

### Accessibility

`src/a11y.ionic.browser.tsx` runs axe-core over every component and page in a real Ionic (without it an `ion-fab-button` is no button, and axe has nothing to judge) and snapshots the violations each has today. A new violation fails the test; a fixed one fails it too, until the snapshot is updated with `-u` — the snapshot is the list of known issues, and a fix's diff shows what it removed. Contrast is judged against Ionic's default palette only; apps set their own colours.

## Documentation site

`packages/docs` is Docusaurus, published at https://docs.smartcompanion.app. It covers more than this repo: setting up and running the [audioguide app](https://github.com/smartcompanion-app/audioguide-app) (content, customization, deployment) as well as the library. Contributing, security and the code of conduct stay in the repo's own files and are only linked.

- Pages are Markdown under `packages/docs/docs/`, parsed as CommonMark (`format: 'detect'`), so `<` and `{` in prose stay text. Admonitions (`:::note`), `<details>`, raw HTML and ```` ```mermaid ```` blocks all work in `.md`; only a page needing JSX — tabs, say — would be `.mdx`.
- Sidebar order is listed by hand in `sidebars.ts` — two sidebars, `guide` (the audioguide) and `library`. A new page needs a line there.
- Write what the code does, checked against the code, not against the schema or older docs: several schema descriptions disagree with the library (tour `stations` are ids, the server list key is `servers`, there is no default language).
- Link to Storybook as `pathname:///storybook/`. It is not a page of the site, so a plain link fails the broken-link check; `pages.yml` copies `packages/ui/storybook-static` into the build under `/storybook/`.
- `@mermaid-js/layout-elk` is a dependency only because `@docusaurus/theme-mermaid` imports it optionally and the build fails to resolve it otherwise. Its version follows that theme's peer range (`^0.1.x`), not npm's latest.
- The package is unscoped on purpose: a `@smartcompanion/*` name would fall into the changesets `fixed` group and be versioned with every release.

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

- `ci.yml` runs on PRs and pushes to `main` (Ubuntu 24.04, Node 22), in three parallel jobs:
  - `lint` — lint, format:check, depcruise
  - `docs` — type-checks the site config and builds the docs site
  - `test` — build, test (Playwright/Chromium), check:publish
- `release.yml` runs on pushes to `main` and drives the changesets flow described above
- `pages.yml` deploys the docs site, with Storybook under `/storybook/`, to GitHub Pages on every push to `main`. The custom domain comes from `packages/docs/static/CNAME`.

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
