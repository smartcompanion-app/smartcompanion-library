# Netlify

A free tier that serves **private** repositories, a deploy preview for every pull request, and header configuration in a file you commit. The easiest start, and what the [Quickstart](../quickstart.md#step-5--deploy-it) uses.

## Setting up

1. Sign in to [Netlify](https://app.netlify.com) with your GitHub account.
2. **Add new project → Import an existing project**, and pick your fork.
3. Set the build settings:

   | Setting | Value |
   | --- | --- |
   | Build command | `npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml && npm run build` |
   | Publish directory | `www` |

4. Deploy.

Every push to `main` now builds and deploys. **Deploys** on the project page can also trigger a deploy by hand.

## Configuration in a file

The same settings can live in the repository, where they are reviewable and versioned. Settings in the file take precedence over the ones in the Netlify interface:

```toml title="netlify.toml"
[build]
  command = "npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml && npm run build"
  publish = "www"

[build.environment]
  NODE_VERSION = "22"
```

## Headers

`netlify.toml` also sets the caching headers:

```toml title="netlify.toml"
[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/data/data.json"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/build/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

`index.html` and `sw.js` must not be cached, or visitors keep an old build. `/build/*` file names are content-hashed and safe to cache forever.

:::note[No redirect rules needed]

The app uses hash-based URLs, so there is no single-page-app fallback to configure. A `/* /index.html 200` rule is not needed.

:::

## Deploy previews

Netlify builds every pull request at its own URL. For an audioguide this is genuinely useful: a content or branding change gets a link you can send to a colleague, and open on a phone, before it reaches visitors.

- **Turn offline support off for previews.** A service worker on a preview caches aggressively and shows reviewers stale content. A [staging variant](../customization/variants.md#a-staging-variant) with `offline_support: "false"` does that.
- **Point previews at staging content** when you also change `data.json`.

Netlify's [deploy contexts](https://docs.netlify.com/configure-builds/file-based-configuration/#deploy-contexts) give previews a build command of their own.

## Custom domain

**Domain management → Add a domain.** Then either:

- **Point a CNAME** at your Netlify address — `guide.museum.org. CNAME my-museum-123.netlify.app.` — which is what you want for a subdomain, or
- **Move the whole domain's DNS** to Netlify, which is convenient if Netlify hosts your main website too.

HTTPS is set up automatically once DNS resolves.

## Private repositories

Netlify's free tier builds and serves private repositories. That matters if your fork carries anything you would rather not publish — unreleased content, an internal staging URL, an exhibition before it opens.

## Free tier limits

Netlify's free plan limits bandwidth and build minutes per month; the current numbers are on [their pricing page](https://www.netlify.com/pricing/). A build of the app takes a couple of minutes, and the app itself is a few megabytes per visitor. The number to watch is bandwidth, and only if your **media** is on Netlify too.

## Other hosts of the same kind

Vercel, Cloudflare Pages, Render and GitLab Pages work the same way: a build command and an output directory.

```
npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml && npm run build
```

```
www
```
