# Development

Working on the library itself — fixing a page, adding a component, changing a service. The full contributor guide is [CONTRIBUTING.md](https://github.com/smartcompanion-app/smartcompanion-library/blob/main/CONTRIBUTING.md); this page is the overview.

## Setup

```bash
git clone https://github.com/smartcompanion-app/smartcompanion-library.git
cd smartcompanion-library
npm install
npm run build
npm test
```

Node 22 is what CI uses. `npm install` also sets up a pre-commit hook that runs Prettier over staged source files.

## The repository

An npm workspaces monorepo:

```
packages/
├─ data/       @smartcompanion/data      TypeScript, compiled with tsc
├─ services/   @smartcompanion/services  TypeScript, compiled with tsc
├─ ui/         @smartcompanion/ui        Stencil components, with Storybook
└─ docs/       this site                 Docusaurus, not published to npm
```

Package boundaries — `ui` does not import `services`, nothing under `packages/ui/src` imports `@ionic/core` — are enforced by `npm run depcruise`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run build` | Build all three packages |
| `npm test` | Run the tests of all three packages |
| `npm run coverage` | Tests with coverage; reports in `packages/*/coverage` |
| `npm run lint` | ESLint. CI fails only on errors; keep warnings at zero too |
| `npm run format:check` | Prettier check |
| `npm run depcruise` | Package boundaries |
| `npm run check:publish` | publint and attw against each package's tarball |
| `npm run storybook -w packages/ui` | Storybook at <http://localhost:6006> |
| `npm run docs:start` | This documentation, with live reload |
| `npm run docs:build` | This documentation, built; fails on a broken link |
| `npm run docs:typecheck` | Type-checks the site's configuration |

Run a single package's scripts with `-w packages/<name>`, e.g. `npm test -w packages/ui`.

## Tests

Vitest throughout. `ui` runs its tests through `stencil-test`, which builds the components in development mode first and then runs five Vitest projects against that build:

| Project | Files | Runs in |
| --- | --- | --- |
| `unit` | `*.test.ts` | Node |
| `snapshot` | `*.snapshot.tsx` | Stencil's mock DOM |
| `spec` | `*.spec.tsx` | Stencil with jsdom |
| `browser` | `*.browser.tsx` | Chromium, through Playwright |
| `browser-ionic` | `*.ionic.browser.tsx` | Chromium, with a real Ionic loaded |

`npm run coverage` measures the `ui` build through its source maps, so it reports against `src`.

## Storybook

Every component has stories in `packages/ui`. `npm run storybook -w packages/ui` serves them while you work; the published [Storybook](pathname:///storybook/) follows `main`.

## The documentation

This site is `packages/docs`: Docusaurus, with every page a Markdown file under `packages/docs/docs/`. The **Edit this page** link at the bottom of each page leads to its source. Adding a page means adding the file and a line in `packages/docs/sidebars.ts`.

`npm run docs:build` fails on a broken link or anchor, and CI runs it on every pull request.

## Releasing

Releases are driven by [changesets](https://github.com/changesets/changesets). A change to published behaviour comes with a changeset:

```bash
npm run changeset
```

Merging to `main` opens a `chore: release` pull request with the version bumps and changelogs; merging that publishes all three packages to npm, with provenance. The three packages always share one version number.
