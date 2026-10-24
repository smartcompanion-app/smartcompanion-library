# GitHub Pages

Free for public repositories, HTTPS and custom domains included, and the CI is already where your code is. The demo apps are deployed this way.

## Enable Pages

**Settings → Pages → Build and deployment → Source: GitHub Actions.**

Not "Deploy from a branch". The workflow below uploads an artifact and deploys it directly; the branch-based source would ignore it.

## A workflow

```yaml title=".github/workflows/deploy.yml"
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy
  cancel-in-progress: false

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-24.04
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - name: Apply customization
        run: npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml

      - name: Build
        run: npm run build

      - uses: actions/upload-pages-artifact@v5
        with:
          path: www

      - uses: actions/deploy-pages@v5
        id: deployment
```

Three things to note:

- **`concurrency` without `cancel-in-progress`.** Two deploys racing each other fight over the Pages environment, and cancelling a half-finished one can leave the site mid-swap.
- **The engraft step brands the build.** Without it you deploy the *Animals* demo.
- **Offline support** comes from `offline_support: "true"` in your values file. See [Offline](../features/offline.md).

Your site appears at `https://<account>.github.io/<repository>/`.

## Serving from a subdirectory

That URL *is* a subdirectory, so unless you attach a custom domain, add the two path fixes:

```yaml
      - name: Build
        run: |
          npm run build
          sed -i 's|"/build/|"build/|g' www/index.html
          sed -i "s|'/sw.js'|'/<repository>/sw.js'|" www/index.html
```

With a custom domain the app sits at the root and neither line is needed.

## Several variants in one repository

The app's own [release workflow](https://github.com/smartcompanion-app/audioguide-app/blob/main/.github/workflows/release.yml) builds two guides and deploys both:

```yaml
      # Default variant
      - run: npm run build
      - run: |
          sed -i 's|"/build/|"build/|g' www/index.html
          sed -i "s|'/sw.js'|'/audioguide-app/animals/sw.js'|" www/index.html
      - run: mv www animals

      # Second variant
      - run: npx engraft apply --template engraft.template.yml --values customization/leon/engraft.variables.yml
      - run: npm run build
      - run: |
          sed -i 's|"/build/|"build/|g' www/index.html
          sed -i "s|'/sw.js'|'/audioguide-app/leon/sw.js'|" www/index.html
      - run: mv www leon

      - run: |
          mkdir _site
          mv animals _site/animals
          mv leon _site/leon

      - uses: actions/upload-pages-artifact@v5
        with:
          path: _site
```

Each variant gets its own directory, service-worker path and URL. Mind that applies are not additive — see [Variants](../customization/variants.md#applies-are-not-additive).

## Custom domain

### 1. DNS

**A subdomain (recommended)** — a `CNAME` record pointing at `<account>.github.io.`:

```
guide.museum.org.   CNAME   <account>.github.io.
```

**An apex domain** — four `A` records, because an apex cannot be a CNAME:

```
museum.org.   A   185.199.108.153
museum.org.   A   185.199.109.153
museum.org.   A   185.199.110.153
museum.org.   A   185.199.111.153
```

Add `AAAA` records for IPv6. GitHub's current addresses are in [their documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) — check there rather than trusting this page.

A subdomain is easier to set up, easier to move, and does not entangle your main website's DNS with a static-site host.

### 2. Tell GitHub

**Settings → Pages → Custom domain**, enter it, save. Wait for the DNS check to pass, then tick **Enforce HTTPS**. The certificate takes a few minutes to issue.

### 3. Keep the CNAME file

GitHub needs a `CNAME` file in the deployed site to keep the domain. A workflow that uploads `www/` does not include it, and the domain is dropped on the next deploy. Write it into the artifact, after the build and before the upload:

```yaml
      - run: echo "guide.museum.org" > www/CNAME
```

## Private repositories

GitHub Pages on a private repository needs a paid GitHub plan. On the free plan the repository has to be public for Pages to serve it. If that is a problem, [Netlify](./netlify.md) serves private repositories on its free tier.

## Limits

| | |
| --- | --- |
| Repository size | 1 GB recommended |
| Published site | 1 GB |
| Bandwidth | 100 GB/month, soft limit |
| Builds | 10 per hour, soft limit |

The app itself is a few megabytes. The number to watch is bandwidth, and only if your **media** is on Pages too: a 60 MB offline guide downloaded by two thousand visitors is 120 GB. A large or busy guide belongs on object storage or behind a CDN. See [Media](../content/media.md#where-to-host).

## Troubleshooting

<details>
<summary>404 after a successful deploy</summary>

The Pages source is still "Deploy from a branch". Change it to GitHub Actions.

</details>

<details>
<summary>The page loads but stays blank</summary>

The subdirectory path fixes are missing. Apply the two `sed` lines above.

</details>

<details>
<summary>The custom domain disappears after every deploy</summary>

The `CNAME` file is not in the uploaded artifact. Add the `echo` step.

</details>

<details>
<summary>"Enforce HTTPS" is greyed out</summary>

The certificate has not been issued yet. Usually minutes, occasionally up to an hour after DNS propagates.

</details>

<details>
<summary>The service worker returns 404</summary>

Its registration path still points at the root. Apply the `sed` fix, and clear the site data on your test device — an old worker keeps serving the old paths.

</details>
