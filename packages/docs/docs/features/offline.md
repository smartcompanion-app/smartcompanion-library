# Offline support

With offline support, a visitor loads the guide once — at the entrance, on the venue Wi-Fi — and it keeps working in a cellar, a casemate, a valley or a basement gallery with no signal.

It is **off by default**, because it is not free: the first start waits for a real download, and the visitor's device has to hold all of it.

## Turning it on

In your values file:

```yaml title="customization/my-museum/engraft.variables.yml"
offline_support: "true"
```

After an apply, every build includes the service worker. Without engraft, `npm run build:offline` gives one offline build while leaving the setting itself off:

```bash
npm run build:offline
```

A build without offline support generates no service worker at all, and loads content online only.

## What happens at runtime

Two mechanisms work together, and it helps to keep them apart.

### The service worker caches what is fetched

[Workbox](https://developer.chrome.com/docs/workbox/) precaches the app itself — its JavaScript, CSS, HTML, the manifest, the icons and the Ionic icons the menu and the player use. On top of that, [`src/sw.js`](https://github.com/smartcompanion-app/audioguide-app/blob/main/src/sw.js) adds two routes:

```js title="src/sw.js"
// data.json: fresh when online, cached when not
routing.registerRoute(
  ({ url }) => url.pathname.endsWith('/data.json'),
  new strategies.NetworkFirst({ cacheName: 'data-cache' }),
);

// media: cache first, network only on a miss
routing.registerRoute(
  ({ request }) => request.url.match(/assets\/.+\..{2,}/),
  new strategies.CacheFirst({ cacheName: 'assets-cache' }),
);
```

**NetworkFirst for `data.json`**: online, the visitor gets your latest file; offline, the last one they loaded.

**CacheFirst for media**: a file is fetched once and then comes from the device — fast, and no repeat bandwidth for you.

The worker takes control of the page as soon as it is installed rather than waiting for every tab to close.

### The app downloads the media

Separately, the app's *offline load service* walks your asset list and fetches every file once, so that it is in the cache before the visitor needs it. That is the progress bar on the loading screen. It waits for the service worker to be in control first — otherwise the files would go past an uncontrolled page and never be cached — and proceeds after ten seconds regardless.

### What gets cached

The download covers the audio in the visitor's language and every asset without a language — the images. Changing the language later downloads that language's audio.

:::warning[Media URLs must contain `assets/`]

The service worker caches media by matching `assets/<name>.<extension>` in the URL. A file at `https://example.org/media/a1en.mp3` is downloaded during loading but **not cached**, and is missing offline. Keep your media in a folder named `assets/`, as the examples do.

:::

## What the visitor experiences

1. They open the guide, ideally on the venue Wi-Fi.
2. The loading screen shows your logo and a progress bar while the media downloads.
3. From then on, the guide works with the network off.

Size the download deliberately: see [Budgeting an offline download](../content/media.md#budgeting-an-offline-download). Under 100 MB is comfortable.

## Updating content on cached devices

**`checksum` is the mechanism.** The app compares the checksum of the `data.json` it just fetched with the one it stored. Only when they differ does it take over the new content and fetch the media again. Change it on every content edit, or devices keep the old guide indefinitely — with no error.

**A device has to be online once** to see an update. A phone that never returns to a network never updates.

**App updates are separate.** A new build — branding, or a new app version — produces new precache revisions. Devices pick them up the next time the app is opened with a connection, and show them from the following start.

## Deploying to a subdirectory

The service worker registers at an absolute path. Served from `/my-museum/` rather than the root, that path is wrong. The app's own release workflow patches it after the build:

```bash
sed -i 's|"/build/|"build/|g' www/index.html
sed -i "s|'/sw.js'|'/my-museum/sw.js'|" www/index.html
```

A variant with its own domain needs neither. See [Deployment](../deployment/index.md#deploying-to-a-subdirectory).

## Requirements

- **HTTPS.** Service workers do not register over plain HTTP. `localhost` is exempt, which is why it works during development.
- **Room on the device.** A 200 MB guide needs 200 MB free, and mobile browsers evict caches under storage pressure. Another reason to keep it small.

## When to leave it off

- **A guide with good mobile coverage throughout**, such as most outdoor walks. Streaming works, and there is no download to wait through.
- **A staging or preview deployment.** Aggressive caching during a content review confuses everyone involved.
- **A very large media set**, where the download takes longer than the visit.

## Testing it

```bash
npm run test:offline
```

runs the service worker tests against an offline build. Then by hand, on a real phone:

1. Open the deployed app over HTTPS and let the loading screen finish.
2. Turn on flight mode.
3. Close the browser completely and open the app again.
4. Walk the entire tour — every station, every image, every audio file, and the language switch if you offer one.

Step 3 matters. An app that still works because its files are in memory is not one that works from the cache.

## Troubleshooting

<details>
<summary>No service worker is registered</summary>

The build has no offline support: `offline_support` was not `"true"` when it was built, or the site is served over plain HTTP.

</details>

<details>
<summary>Content changed but devices show the old version</summary>

The `checksum` did not change. It is the only signal the app has.

</details>

<details>
<summary>Media is missing offline</summary>

Its URL does not contain `assets/`, so the service worker does not cache it. See [What gets cached](#what-gets-cached).

</details>

<details>
<summary>It works in the browser but not from the home screen</summary>

On some platforms an installed app has storage of its own. Install it first, *then* open it and let it load, then test offline.

</details>

<details>
<summary>The download never finishes</summary>

An asset URL returns an error. Open the network tab during loading; the failed request is there.

</details>
