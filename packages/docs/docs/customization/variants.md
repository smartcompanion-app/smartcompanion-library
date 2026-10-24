# Variants

A variant is one branded build: a values file plus its assets and, if bundled, its content. A single repository can hold as many as you like — one per institution, one per exhibition, or a production and a staging build of the same guide.

```
customization/
├─ leon/                       # the example that ships with the app
│  ├─ engraft.variables.yml
│  ├─ assets/
│  └─ data/
├─ my-museum/
│  ├─ engraft.variables.yml
│  ├─ assets/
│  └─ data/
└─ my-museum-staging/
   └─ engraft.variables.yml
```

Build one by applying its values file, then building:

```bash
npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml
npm run build
```

## Applies are not additive

Each `engraft apply` rewrites the same files. Applying variant B after variant A does **not** start from a clean tree: B's values overwrite A's where B names them, and a variable B leaves out keeps A's value — unless it has a default. `offline_support`, `messaging_support` and `primary_color_contrast` do: those three go back to their default whenever B does not name them. Everything else, the colours, logos and fonts included, stays as A left it.

That is a real trap when building several variants in one job. Two ways to stay honest:

**Reset between builds.** Return the files engraft touches to their committed state before each apply:

```bash
git checkout -- src stencil.config.ts scripts/generate-icons.mjs
npx engraft apply --template engraft.template.yml --values customization/next/engraft.variables.yml
npm run build
```

**Or set every variable in every values file.** More verbose, and a new upstream variable then needs adding to each file, but it removes the ordering question.

**Or build in a copy.** The app's `scripts/build-variant.mjs` copies the repository to `.variants/<name>/`, applies a values file there and builds it with offline support, leaving your own working tree untouched:

```bash
node scripts/build-variant.mjs customization/my-museum
# the build is in .variants/my-museum/www
```

It takes the folder holding the `engraft.variables.yml`. The app's own font tests use it.

## Building several in one run

```bash title="build-all.sh"
#!/usr/bin/env bash
set -euo pipefail

mkdir -p _site

for variant in my-museum my-garden; do
  git checkout -- src stencil.config.ts scripts/generate-icons.mjs
  npx engraft apply \
    --template engraft.template.yml \
    --values "customization/$variant/engraft.variables.yml"
  npm run build
  mv www "_site/$variant"
done

git checkout -- src stencil.config.ts scripts/generate-icons.mjs
```

Each variant then lives at `/<variant>/` on the deployed site. The app's own release workflow does the same with two variants — *Animals* (no apply) and *Leon* — and deploys both to [GitHub Pages](../deployment/github-pages.md#several-variants-in-one-repository).

:::warning[Serving from a subdirectory needs two path fixes]

A build assumes it is served from the root of its domain. Served from `/my-museum/` instead, two things break: the absolute script paths in `index.html`, and the service worker registration path. Patch both after each build:

```bash
sed -i 's|"/build/|"build/|g' www/index.html
sed -i "s|'/sw.js'|'/my-museum/sw.js'|" www/index.html
```

A variant with its own domain does not need this.

:::

## Committing the result, or not

Two workable habits; the choice mostly comes down to who does the deploying.

### Do not commit the applied state (recommended)

The repository holds only `customization/`. CI applies the values file and builds; the modified source never reaches a commit.

- `git status` is clean between builds, and `git diff` after an apply shows exactly what the customization did
- Upstream merges do not conflict — you have not touched the files upstream changes
- Requires a build step that runs `engraft apply`, which every CI and host such as Netlify can do

### Commit the applied state

Apply once, commit the result, and treat your fork as an already-branded app.

- Anyone can clone and `npm run build` with no extra step
- Every upstream merge can conflict in `stencil.config.ts`, `src/index.html`, `src/manifest.json`, `src/global/app.scss`, `src/global/_fonts.scss` and `scripts/generate-icons.mjs`, and you resolve them by hand

Keep the values file committed either way — it is the record of *why* those files look the way they do.

## Staying current with upstream

Fork, do not copy. A fork keeps a remote you can pull from:

```bash
git remote add upstream https://github.com/smartcompanion-app/audioguide-app.git
git fetch upstream
git merge upstream/main
```

If your branding lives only in `customization/`, that merge is usually clean. Then:

```bash
npm install
npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml
npm run build
```

**Read the changelog before merging.** Releases are [CalVer](../reference/versioning.md), so the version number does not signal breaking changes — the changelog does.

**Watch for new variables.** A new upstream variable keeps the sample value or its default in your build, which is usually fine and occasionally not. Diffing the template across the merge is the quickest check:

```bash
git diff HEAD@{1} HEAD -- engraft.template.yml
```

## Testing a variant

`npm test` runs the end-to-end suite against whatever is currently applied, and the suite is written for the *Animals* demo. Build every variant in CI regardless — a variant that fails to build is a deploy that fails at the worst moment.

A cheap assertion after the apply catches a whole class of silent failure:

```bash
grep -q 'My Museum Audioguide' src/index.html
```

## A staging variant

The same branding, different content and no service worker:

```yaml title="customization/my-museum-staging/engraft.variables.yml"
title_short: Museum (staging)
title: My Museum Audioguide — Staging
description: Staging build. Not for visitors.
lang: en

data_url: https://content.example.org/guide/staging/data.json
offline_support: "false"

primary_color: "#8a3324"
background_color: "#f4efe7"

logo: ../my-museum/assets/logo.png
logo_dark: ../my-museum/assets/logo-dark.png
icon_source: customization/my-museum/assets/app-icon-512.png
```

`offline_support: "false"` matters: a service worker on a staging site caches aggressively and confuses everyone reviewing a content change. The logos are referenced from the production variant rather than copied.
