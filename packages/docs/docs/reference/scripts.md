# Scripts

Every npm script of the app.

| Command | What it does |
| --- | --- |
| `npm start` | Dev server with live reload at `:3333` |
| `npm run build` | Production build into `www/` |
| `npm run build:offline` | Production build **with** the service worker |
| `npm run icons` | Generate the icon set from the icon source — runs before every build and start |
| `npm test` | Build, then run the end-to-end suite without the offline and font specs |
| `npm run test:offline` | Offline build, then run only the offline specs |
| `npm run test:fonts` | Build the font fixture in a copy, then run only the font specs |
| `npm run test:dev` | Run the suite against an already running dev server |
| `npm run lint` | ESLint over `src` and `test` |
| `npm run format` | Prettier, write mode |
| `npm run format:check` | Prettier, check mode |
| `npm run changeset` | Describe a change for the release notes |
| `npm run version`, `npm run release` | Apply changesets and tag a release — CI does this |

## Development

### `npm start`

Runs `npm run icons`, then `stencil build --dev --watch --serve`: the app at <http://localhost:3333>, rebuilt on save.

`stencil.config.ts` is read once at start, so a change there needs a restart, not a save.

### `npm run build`

Production build into `www/`. A service worker only if offline support is on in `stencil.config.ts` — which is what `offline_support: "true"` in a values file does.

### `npm run build:offline`

`OFFLINE_SUPPORT=true stencil build`: the same build with Workbox attached, whatever `stencil.config.ts` says.

### `npm run icons`

Generates the icon set from the image named in `scripts/generate-icons.mjs` into the git-ignored `.pwa-assets/`. It runs before `start`, `build` and `build:offline` on its own; run it by hand only to look at the result. See [Logos and icons](../customization/logos-and-icons.md#the-icon-set).

## Testing

The suite is WebdriverIO with Mocha, driving Chrome through `puppeteer-core`. Configuration in `wdio.conf.ts`, specs in `test/specs`, page objects in `test/pageobjects`.

**Three modes, which do not overlap:**

| Command | Specs | Server port | Serves |
| --- | --- | --- | --- |
| `npm test` | `test/specs/**` except `offline/` and `fonts/` | `:4567` | `www/`, from `npm run build` |
| `npm run test:offline` | `test/specs/offline/**` only | `:4568` | `www/`, from `npm run build:offline` |
| `npm run test:fonts` | `test/specs/fonts/**` only | `:4569` | `.variants/fonts/www/` |

`TEST_OFFLINE=true` and `TEST_FONTS=true` switch `wdio.conf.ts` between them. CI runs all three, so run all three before pushing:

```bash
npm test && npm run test:offline && npm run test:fonts
```

The regular run passes `--disable-web-security` to Chrome; the offline and font runs deliberately do not — the service worker needs a normal origin to register against.

### `npm run test:fonts`

Fonts only show in a customized build, so this run does not test your working tree. `scripts/build-variant.mjs` copies the repository to `.variants/fonts/`, applies the values file in `test/fixtures/fonts/` there and builds it with offline support; the specs then run against that copy. Your own working tree stays as it is. See [Variants](../customization/variants.md#applies-are-not-additive).

### `npm run test:dev`

`wdio run wdio.conf.ts --baseUrl=http://localhost:3333`: the same specs against a dev server you already started. It skips the build, which makes it the fast loop while writing a spec. It runs once; it is not a watch mode.

## Quality

`npm run lint` runs ESLint with `typescript-eslint` over `src` and `test`. `npm run format` and `format:check` run Prettier — 180-character lines, single quotes, two-space indent, LF.

A husky pre-commit hook runs Prettier over staged files under `src` and `test`. `npm install` sets it up.

## Releasing

Releases are driven by [changesets](https://github.com/changesets/changesets). Only `npm run changeset` is run by hand: it asks for a bump level and a description, which lands in the changelog and the release notes. Commit the generated file in `.changeset/` with your pull request. CI does the rest — see [Versioning](./versioning.md).

## Troubleshooting

<details>
<summary><code>npm test</code> fails to start Chrome</summary>

`puppeteer-core` uses a Chrome that is already installed. Make sure one is installed and can be found.

</details>

<details>
<summary>Tests pass locally and fail in CI</summary>

CI adds `--headless --disable-gpu --no-sandbox --disable-dev-shm-usage`. Reproduce with `CI=true npm test`.

</details>

<details>
<summary>The offline specs fail with no service worker</summary>

You ran `npm test`, not `npm run test:offline`.

</details>

<details>
<summary>The dev server ignores a change to <code>stencil.config.ts</code></summary>

It is read at start. Restart the dev server.

</details>
