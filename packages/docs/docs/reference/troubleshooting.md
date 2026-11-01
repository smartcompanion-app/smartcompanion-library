# Troubleshooting

## Start here

Three things to establish before anything else:

1. **The app version** — `document.querySelector('meta[name="version"]').content`
2. **The browser console** — most failures leave a message there and nowhere else
3. **The network tab** — a failed `data.json` or asset request is visible at once

To debug a phone, connect it: Safari's Web Inspector for iOS, `chrome://inspect` for Android. Guessing from the phone screen alone wastes an afternoon.

## The app does not load

<details>
<summary>Blank white page</summary>

Open the console.

- **A module loading error** — the `.js` files are served with the wrong MIME type. See [Self-hosting](../deployment/self-hosting.md#mime-types).
- **404 on `/build/…`** — a subdirectory deployment without the path fixes. See [Deployment](../deployment/index.md#deploying-to-a-subdirectory).
- **Nothing at all** — check that `index.html` is served, and is the build you think it is.

</details>

<details>
<summary>It goes straight to the error screen</summary>

The content could not be loaded. In order of likelihood:

1. **`data_url` is wrong.** Open it directly in a browser.
2. **CORS.** The console says so explicitly. See [Media](../content/media.md#2-cors).
3. **Mixed content.** The app is on HTTPS and the data URL is HTTP. The browser blocks it.
4. **Invalid JSON.** A trailing comma is enough. Run it through a validator.
5. **The content host is down.**

</details>

<details>
<summary>The language screen is empty, or the content never updates</summary>

A required key is missing from `data.json` — `checksum`, `assets`, `stations`, `languages` or `texts`. The app ignores such a file without an error: a fresh device has no languages to offer and shows an empty language screen, and a device that loaded the guide before keeps its old content. Validate against the [schema](../content/data-format.md).

</details>

<details>
<summary>It loads but the station list is empty</summary>

The content loaded but has nothing for the chosen language: no station carries that `language`. Validate against the [schema](../content/data-format.md).

</details>

<details>
<summary>Stations appear in one language but not another</summary>

Stations are looked up by language, without a fallback. A station missing from the Spanish set does not exist for a Spanish visitor. Run the [checklist script](../content/data-format.md#checklist).

</details>

## Content

<details>
<summary>Content changed but the app shows the old version</summary>

**Check the `checksum` first.** Nearly always it was not changed — and devices that loaded the guide before keep their stored content until it does. See [Data format](../content/data-format.md#checksum).

Then:

1. Is the change actually published? `curl` the data URL.
2. A CDN in front of your content host may serve the old file. Purge it.
3. With offline support, the device has to be online once to fetch the new file.

</details>

<details>
<summary>A new station does not show up</summary>

- It is missing in one or more languages
- Its `id` duplicates another station's — both entries then show whichever comes later in the file. A duplicate `number` hides nothing; it only makes the keypad open one of the two.
- The `checksum` did not change

</details>

<details>
<summary>Images do not load</summary>

- An id in `stations.images` does not exist in `assets` — the page then fails to render, with an error in the console
- The `externalUrl` returns 404. Open it directly.
- CORS, or mixed content

</details>

<details>
<summary>The keypad cannot find a station</summary>

It matches `number` exactly, as a string, and takes two digits by default. See [Stations](../content/stations.md#numbering).

</details>

<details>
<summary>A text shows as its key, such as "try again" or "menu share-app"</summary>

The key is missing from `texts` for the current language. See [UI texts](../content/ui-texts.md#when-a-text-is-missing).

</details>

## Audio

<details>
<summary>Audio does not play</summary>

1. Open the asset URL directly. Does it download and play?
2. CORS on the media host
3. Range requests: `curl -I -H "Range: bytes=0-99" <url>` should give `206`
4. The codec — re-encode to plain MP3
5. The first play in a session must come from a tap. See [Audio](../features/audio.md#the-autoplay-rule).

</details>

<details>
<summary>It plays but cannot be scrubbed</summary>

The media host does not support range requests. See [Media](../content/media.md#3-range-requests).

</details>

<details>
<summary>Audio stops when the screen locks</summary>

Test the deployed app on a real device, not the dev server. If it persists, note the browser and system versions and open an issue — background audio is platform-specific.

</details>

<details>
<summary>The lock screen shows the wrong title</summary>

Some platforms prefer the MP3's own ID3 metadata. Strip or correct it:

```bash
ffmpeg -i in.mp3 -map_metadata -1 -metadata title="1 – The Great Hall" -codec copy out.mp3
```

</details>

## Offline

<details>
<summary>No service worker registers</summary>

- The build has no offline support — `offline_support` was not `"true"`, and it was not built with `npm run build:offline`
- The site is on plain HTTP — service workers need HTTPS (`localhost` excepted)
- The registration path is wrong for a subdirectory deployment

</details>

<details>
<summary>Media is missing offline</summary>

Its URL does not contain `assets/`, so the service worker does not cache it. See [Offline](../features/offline.md#what-gets-cached).

</details>

<details>
<summary>The download never finishes</summary>

An asset fails. Open the network tab while the loading screen is up; the failed request is there.

</details>

<details>
<summary>An old version keeps being served</summary>

A service worker doing its job with stale files.

- `index.html` and `sw.js` must be served with `Cache-Control: no-cache`
- Purge your CDN for both
- To reset a test device: DevTools → Application → Storage → Clear site data

</details>

<details>
<summary>A menu icon is missing offline</summary>

Ionic icons are precached one by one. A new icon has to be added to `globPatterns` in `stencil.config.ts`. See [Configuration](./configuration.md#precache-patterns).

</details>

## Build and customization

<details>
<summary><code>npm install</code> fails</summary>

Node 22 or newer — check with `node --version`.

</details>

<details>
<summary>The build stops with an error about <code>DATA_URL</code>, <code>FONT_DIR</code> or <code>ICON_SOURCE</code></summary>

A repository path has to sit inside a folder, stay inside the repository and use forward slashes, and the icon source has to exist. The message names the path it got.

</details>

<details>
<summary>engraft did not change anything</summary>

- A misspelled variable — engraft does not warn about values the template does not declare
- `logo`, `logo_dark` and `font_stylesheet` are relative to the **values file**; `icon_source`, `data_url` and `font_dir` to the **repository root**
- Check with `git diff --stat` after the apply

</details>

<details>
<summary>A variant shows values of another one</summary>

Applies are not additive. Reset the files between them:

```bash
git checkout -- src stencil.config.ts scripts/generate-icons.mjs
```

See [Variants](../customization/variants.md#applies-are-not-additive).

</details>

<details>
<summary>The deployed guide is the Animals demo</summary>

The engraft step is missing from your build command. See [Deployment](../deployment/index.md#the-build-command).

</details>

## Appearance

<details>
<summary>Colours look wrong in dark mode</summary>

The dark palette is derived from the light background. Override the derived value if it comes out badly — see [Colors](../customization/colors.md#overriding-a-derived-colour).

</details>

<details>
<summary>The logo is invisible in dark mode</summary>

`logo_dark` is a separate file, not a filter. See [Logos and icons](../customization/logos-and-icons.md#the-dark-variant).

</details>

<details>
<summary>The station progress ring is hard to see</summary>

It is the primary colour stepped 18 % off the background. If your primary is close to your background, that is not enough — override `station_icon_progress_color`.

</details>

## Deployment

<details>
<summary>GitHub Pages returns 404</summary>

The Pages source is still "Deploy from a branch". Set it to GitHub Actions.

</details>

<details>
<summary>The custom domain disappears on every deploy</summary>

The `CNAME` file is not in the uploaded artifact. See [GitHub Pages](../deployment/github-pages.md#3-keep-the-cname-file).

</details>

## Getting help

Search the existing issues first — [app](https://github.com/smartcompanion-app/audioguide-app/issues), [library](https://github.com/smartcompanion-app/smartcompanion-library/issues) — or ask in the [discussions](https://github.com/orgs/smartcompanion-app/discussions).

A useful report has:

- The app version from the meta tag
- Browser and its version, system version, device
- What you did, what happened, what you expected
- Console output and the failing network request
- A link to a deployment showing the problem, if it is public

Security problems do **not** go into the issue tracker; see the [security policy](https://github.com/smartcompanion-app/audioguide-app/blob/main/SECURITY.md).
