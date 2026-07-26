# Contributing

This guide covers working on the three packages in this monorepo: `@smartcompanion/data`, `@smartcompanion/services`, and `@smartcompanion/ui`.

## Developing

### Local setup

1. Fork and clone the repo.
1. Install the dependencies — one install covers every workspace.

    ```shell
    npm install
    ```

1. Install the Chromium build Playwright drives the UI browser tests with.

    ```shell
    npx playwright install chromium
    ```

`npm install` also sets up a [husky](https://typicode.github.io/husky/) pre-commit hook that runs Prettier over staged files under `packages/*/src`, so formatting is fixed before it can reach CI.

### Scripts

Every script exists at the root, where it fans out across all three packages, and per package via `-w packages/<name>`.

#### `npm run build`

Compiles `data` and `services` with `tsc` into their `dist/`, and builds `ui` with Stencil into CJS, ESM, and custom-elements distributions. `data` and `services` must be built before `ui` can resolve them, which the root script's ordering takes care of.

#### `npm test`

Runs Vitest across all packages. See [Testing](#testing) for what that covers in `ui`.

#### `npm run lint` / `npm run format` / `npm run format:check`

ESLint over `src`, and Prettier in write or check mode. CI runs `lint` and `format:check`; `format` is the one that rewrites files.

#### `npm run depcruise`

Enforces the package boundaries declared in [`.dependency-cruiser.json`](.dependency-cruiser.json). Four rules matter:

- **`data-is-a-leaf`** — `@smartcompanion/data` may not import from any other workspace package.
- **`services-no-ui`** — services are consumed by the UI, never the reverse.
- **`ui-shipped-no-services`** — shipped UI code depends on `packages/ui/src/contracts`, never on `@smartcompanion/services`, so consuming apps can pass any object satisfying the contract. Tests and stories are exempt.
- **`no-circular`** — intra-package imports point at concrete modules (`../update/updater`), not at directory barrels (`../update`). A barrel re-exports its whole directory, so importing one type from it drags in every sibling and closes cycles that would not otherwise exist.

#### `npm run check:publish`

Runs [`publint`](https://publint.dev/) and [`attw`](https://arethetypeswrong.github.io/) against the tarball each package would actually publish — entry points resolve, types match the runtime exports, nothing is missing from `files`.

#### `npm run storybook -w packages/ui`

Dev server at <http://localhost:6006>. `npm run watch -w packages/ui` is the Stencil watch build if you would rather work against a host app.

### Module format

`@smartcompanion/data` and `@smartcompanion/services` are ESM-only (`"type": "module"`, `module: nodenext`, with an `exports` map). Relative imports in those two packages need explicit extensions:

```ts
import { Updater } from '../update/updater.js'; // a file
import { Storage } from '../storage/index.js'; // a directory
```

The `.js` refers to the emitted file — the source is still `.ts`. Extensionless and directory specifiers compile fine but produce output Node cannot load, which is the bug this replaced. `require()` of these two packages fails by design.

`@smartcompanion/ui` is unaffected; Stencil generates its own outputs.

## Testing

`data` and `services` use plain Vitest against `test/**/*.test.ts`.

`ui` runs four Vitest projects, split by filename suffix — see [`packages/ui/vitest.config.ts`](packages/ui/vitest.config.ts):

| Project | Files | Environment |
| --- | --- | --- |
| `unit` | `src/**/*.test.{ts,tsx}` | node |
| `snapshot` | `src/**/*.snapshot.{ts,tsx}` | stencil |
| `spec` | `src/**/*.spec.{ts,tsx}` | stencil + jsdom |
| `browser` | `src/**/*.browser.{ts,tsx}` | real Chromium via Playwright |

The `browser` project needs `npx playwright install chromium` once. To run a single project:

```shell
npm run test -w packages/ui -- --project=browser
```

## Releasing

Releases run on [changesets](https://github.com/changesets/changesets). Publishing is never done from a laptop.

1. **Add a changeset with your change.** Anything that alters published behaviour needs one:

    ```shell
    npm run changeset
    ```

    Pick the bump level and describe the change in the consumer's terms — the text lands verbatim in `CHANGELOG.md`. The three packages are versioned in lockstep, so a changeset for one bumps all three; select whichever package the change belongs to and let the config handle the rest. Commit the generated file in `.changeset/` with your pull request.

    Changes that publish nothing — CI config, docs, tooling — do not need one.

    > The peer range on `@smartcompanion/data` in `services` and `ui` is `>=0.9.0`, not `^0.9.0`, on purpose. Changesets escalates a peer *dependent* to a major bump whenever the new dependency version falls outside its declared range, and `^0.9.x` excludes `0.10.0` — with a caret there, every release would come out as a major. Leave it alone while these packages are on 0.x.

2. **Merge to `main`.** The `release` workflow collects all pending changesets into a `chore: release` pull request that applies the version bumps and writes the changelogs.

3. **Merge the `chore: release` pull request.** That triggers the publish. Packages go to npm over [trusted publishing](https://docs.npmjs.com/trusted-publishers) — the workflow's OIDC identity is exchanged for a short-lived token and signs the provenance attestation, so there is no npm token stored in this repository.

Pushing a `vX.Y.Z` tag does nothing; that was the old flow.

## Pull requests

Run the full gate before pushing:

```shell
npm run lint && npm run format:check && npm run depcruise && npm test
```

The pull request template lists the same checks plus the changeset. CI runs them on every pull request.
