# Deployment

A build produces `www/` — HTML, JavaScript, CSS, a manifest, the icons, your content if you bundle it, and optionally a service worker. That is the entire deployable artifact. There is no server-side component, no database, and nothing to keep running.

Anything that serves static files over HTTPS can host it.

## Choosing

| Option | In short |
| --- | --- |
| [GitHub Pages](./github-pages.md) | Free, custom domains, and CI built in. What the demo apps use. |
| [Netlify](./netlify.md) | Free tier, private repositories, a preview for every pull request |
| [Self-hosting](./self-hosting.md) | Your own nginx or Apache, or object storage behind a CDN |
| [Managed](./managed.md) | SmartCompanion runs it, with a content management system on top |

| | GitHub Pages | Netlify | Self-hosted | Managed |
| --- | --- | --- | --- | --- |
| Cost | Free | Free tier | Your infrastructure | Paid plan |
| Private repository | Paid GitHub plans | Free tier | n/a | n/a |
| Custom domain | Yes | Yes | Yes | Yes |
| HTTPS | Automatic | Automatic | Yours to arrange | Included |
| CI | GitHub Actions | Built in | Yours to build | Included |
| Deploy previews | No | Yes | No | n/a |
| Content management | No | No | No | Yes |
| Support | Community | Community | Yours | Included |

## Requirements, whichever you pick

**HTTPS.** Not optional. Service workers do not register over plain HTTP, and browsers block media fetched over HTTP from an HTTPS page. Every option above gives you a certificate for free.

**Correct MIME types.** `.js` as `application/javascript`, `.json` as `application/json`. Every mainstream host gets this right; hand-written server configurations sometimes do not.

**No rewrite rules.** The app uses hash-based URLs — `https://guide.example.org/#/stations/3` — so a static host without single-page-app fallback serves it correctly. That is deliberate, and what makes GitHub Pages a first-class target.

**A short URL.** It goes on a QR code. `guide.museum.org` scans from further away than `museum.org/en/visit/services/audioguide/`.

## The build command

On any host that builds for you, the command applies your branding and then builds:

```bash
npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml && npm run build
```

The output directory is `www`. Without the engraft step you deploy the *Animals* demo.

## Caching

The one thing worth configuring on any host:

| Path | `Cache-Control` | Why |
| --- | --- | --- |
| `/index.html` | `no-cache` | The entry point. Must be revalidated or updates never arrive. |
| `/sw.js` | `no-cache` | The service worker must be checked on every load. |
| `/data/data.json` | `no-cache` | Your bundled content, if you bundle it |
| `/build/*` | `max-age=31536000, immutable` | Content-hashed file names, safe to cache forever |
| `/assets/*` | `max-age=86400` | Icons and logos; a day is a reasonable compromise |

Get `index.html` and `sw.js` wrong and visitors keep an old build indefinitely. Everything else is a performance detail.

Media on another host is cached by that host's rules; long lifetimes are right there, since the URLs are stable.

## Deploying to a subdirectory

If the app is served from `/my-museum/` rather than the root of a domain, two things need patching after the build:

```bash
sed -i 's|"/build/|"build/|g' www/index.html
sed -i "s|'/sw.js'|'/my-museum/sw.js'|" www/index.html
```

The first makes the script paths relative, the second corrects the service worker registration. This is what the app's own release workflow does for its two demo variants. A deployment at the root of a domain needs neither.

## Before you publish

- [ ] The build is the variant you meant — check the title in the browser tab
- [ ] `data_url` points at production content, not staging
- [ ] The site is on HTTPS with a valid certificate
- [ ] Media loads: no CORS errors in the console
- [ ] Every station plays, in every language
- [ ] Light and dark mode both look right
- [ ] The home-screen icon and name are right
- [ ] With offline support: load once, switch to flight mode, walk the whole tour
- [ ] The QR code resolves, and is the one you are about to print
