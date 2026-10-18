# Progressive Web App

The guide is a website that behaves like an app. Visitors reach it with a URL or a QR code; if they want, they add it to their home screen, and it opens full screen with its own icon.

No app store, no review process, no separate iOS and Android builds, and no install needed for it to work.

## The manifest

[`src/manifest.json`](https://github.com/smartcompanion-app/audioguide-app/blob/main/src/manifest.json) tells the browser how to treat the installed app:

```json
{
  "name": "Animals Audioguide",
  "short_name": "Animals",
  "description": "A sample audioguide app for animals",
  "lang": "en",
  "start_url": ".",
  "display": "standalone",
  "orientation": "portrait",
  "icons": [ … ],
  "background_color": "#faefdc",
  "theme_color": "#faefdc"
}
```

Everything except `start_url`, `display`, `orientation` and `icons` comes from your [customization variables](../customization/variables.md), so branding the manifest is the same operation as branding everything else.

| Field | Effect |
| --- | --- |
| `name` | Full name — install prompt, task switcher |
| `short_name` | Under the home-screen icon. About 12 characters before it is cut off. |
| `display: standalone` | Opens without the browser's address bar |
| `orientation: portrait` | Asks for portrait, which is how a phone audioguide is held |
| `background_color` | The splash background while the app starts |
| `theme_color` | The colour of the system interface around the app |

The icons are generated from your one icon image — see [Logos and icons](../customization/logos-and-icons.md#the-icon-set).

## Installing

The prompt is the browser's, not the app's, and it differs everywhere:

- **Android, Chrome** — an install banner, or **⋮ → Add to Home screen** / **Install app**.
- **iOS, Safari** — **Share → Add to Home Screen**. Safari never prompts; the visitor has to know. If home-screen installs matter to you, say so next to the QR code.
- **Desktop** — an install icon in the address bar of Chrome and Edge. Mostly useful to you while testing.

The guide works fully in a browser tab. Installing adds a home-screen icon and a full-screen display — nothing more.

## `theme-color`

`index.html` has two `theme-color` metas, split by colour scheme, so the browser has a sensible value before any JavaScript runs. At runtime `src/global/app.ts` reads the live background colour and writes it into both, whenever the palette changes.

It works this way because the dark background is *derived* from the light one in Sass — only the compiled stylesheet knows it — and because an [embedding page](./embedding.md) can force a palette, after which the media query no longer says which meta applies.

## Dark mode

The app follows the operating system: `app.ts` watches `prefers-color-scheme: dark` and toggles the class `ion-palette-dark` on `<html>`. There is no switch in the app and no variable to force a mode. Design for both — see [Colors](../customization/colors.md#dark-mode).

## The version meta

Every build carries its version:

```html
<meta name="version" content="dev" />
```

The app's release workflow replaces `dev` with the release version. It is the quickest way to find out what a device is running:

```js
document.querySelector('meta[name="version"]').content; // "2026.1.0"
```

A fork building on its own keeps `dev` unless it stamps a version too. See [Versioning](../reference/versioning.md).

## QR codes

Most visitors arrive by QR code, so it is worth getting right:

- **Point at the entry URL**, not at a station, unless the code is at that station.
- **Use HTTPS** — the app needs it, and some scanners refuse plain HTTP.
- **Preselect the language** on printed material for one language: `?language=en`. See [Languages](../content/languages.md#preselecting-a-language).
- **Keep the URL short.** Fewer characters make a coarser code that scans from further away in bad light.
- **Print it big enough.** 3 cm square scans at arm's length; a poster across a room needs 15 cm or more.
- **Add a line of text.** "Scan for the free audioguide — no app needed" removes the doubt about installing anything.
- **Test the printed code** on cheap phones, in the actual lighting.
- **Never change the URL after printing.** If you must, keep the old one redirecting.

## Storage

The app keeps the chosen language, the loaded content, listening progress and the PIN state in the device's local storage, and — with offline support — the app and media in the browser's cache.

All of it is per device and per browser. Nothing is sent anywhere. Clearing the site's data resets everything, which is also the first thing to try when a device behaves strangely.

## Limits worth knowing

- **iOS Safari is stricter about storage** than Android, and may evict the caches of a site that has not been opened for a while.
- **No push notifications**, on any platform.
- **`orientation: portrait`** is a request; some platforms honour it only for installed apps.
- **In-app browsers** — a link opened inside Instagram, Facebook or a QR scanner app — can behave differently from the real browser, including not offering an install. If your visitors arrive through social media, test there.
