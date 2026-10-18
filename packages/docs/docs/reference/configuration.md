# Configuration

All build-time configuration of the app lives in [`stencil.config.ts`](https://github.com/smartcompanion-app/audioguide-app/blob/main/stencil.config.ts). Changing it requires a rebuild — there is no runtime configuration file.

In practice you do not edit it by hand: [engraft](../customization/index.md) writes your values file into it. Edit it directly only to try something quickly.

## The four settings

```ts title="stencil.config.ts"
const TITLE = "Animals";
const DATA_URL = "https://smartcompanion-app.github.io/data-format/animals/data.json";
const OFFLINE_SUPPORT = process.env.OFFLINE_SUPPORT === 'true' || false;
const MESSAGING_SUPPORT = true;
```

### `TITLE`

The app title, available to the app as `Env.TITLE`. The audio player shows it in the device's media controls. The page `<title>` and the manifest's `name` are set separately; engraft keeps all three in step from the `title` variable.

### `DATA_URL`

Where the app finds its content, in one of two forms.

**An absolute URL** — HTTPS, with cross-origin requests allowed unless it is on the same origin as the app. See [Media](../content/media.md#2-cors).

**A path inside the repository**, which bundles the content into the build:

```ts
const DATA_URL = "customization/my-museum/data/data.json";

const IS_LOCAL_DATA = !/^https?:\/\//i.test(DATA_URL);
const LOCAL_DATA_DIR = IS_LOCAL_DATA ? DATA_URL.replace(/\/[^/]*$/, '') : null;
const SERVED_DATA_URL = IS_LOCAL_DATA ? DATA_URL.replace(/^.*\//, 'data/') : DATA_URL;
```

| | |
| --- | --- |
| `LOCAL_DATA_DIR` | The folder part — copied into the build |
| `SERVED_DATA_URL` | What the app actually fetches — always `data/<filename>` |

The folder becomes a `copy` entry on the output target with the fixed destination `data`, and `Env.DATA_URL` is the served URL. So the repository path is free — `customization/leon/data/` keeps a variant's content beside its branding — while the served path is always `data/`. That is why asset URLs in a bundled `data.json` start with `data/`. See [Bundling the content with the app](../content/media.md#bundling-the-content-with-the-app).

Two guards stop the build early: the path has to sit inside a folder, and it has to stay inside the repository — no absolute path, no `..`, forward slashes only. Either mistake would copy the wrong files into a published build.

### `OFFLINE_SUPPORT`

```ts
const OFFLINE_SUPPORT = process.env.OFFLINE_SUPPORT === 'true' || false;
```

Two ways in: the environment variable, which `npm run build:offline` sets, or the literal at the end of the expression, which engraft rewrites. When true, the `serviceWorker` configuration is attached to the output target; when false, **no service worker is generated**. See [Offline](../features/offline.md).

### `MESSAGING_SUPPORT`

Installs the `postMessage` listener that lets a host page restyle the app inside an iframe. On in the *Animals* demo, off after an apply unless the values file asks for it. See [Embedding](../features/embedding.md).

## The `env` block

The four become runtime values, available as `Env.*`:

```ts
env: {
  TITLE: TITLE,
  DATA_URL: SERVED_DATA_URL,
  OFFLINE_SUPPORT: OFFLINE_SUPPORT ? "enabled" : "disabled",
  MESSAGING_SUPPORT: MESSAGING_SUPPORT ? "enabled" : "disabled",
},
```

The switches become the strings `"enabled"` and `"disabled"`, which is what the code compares against. Values are inlined at build time, and nothing here is secret — everything in `env` ships to the browser.

## The output target

```ts
outputTargets: [
  {
    type: 'www',
    copy: [{ src: '../.pwa-assets', dest: 'assets/icon' }, ...(LOCAL_DATA_DIR ? [{ src: `../${LOCAL_DATA_DIR}`, dest: 'data' }] : [])],
    serviceWorker: OFFLINE_SUPPORT ? { swSrc: 'src/sw.js', globPatterns: [ … ] } : null,
    baseUrl: '/',
  },
],
```

`copy` brings in the generated icon set and, for bundled content, your data folder.

`baseUrl: '/'` is why a subdirectory deployment needs the two path fixes in [Deployment](../deployment/index.md#deploying-to-a-subdirectory).

### Precache patterns

With offline support, Workbox precaches by pattern:

```ts
globPatterns: [
  '**/*.{js,css,json,html,ico,png}',
  '**/list.svg',
  '**/keypad.svg',
  '**/chatbubbles.svg',
  '**/menu-outline.svg',
  '**/pause.svg',
  '**/play.svg',
  '**/play-skip-back.svg',
  '**/play-skip-forward.svg',
  '**/radio-outline.svg',
  '**/refresh-circle.svg',
  '**/backspace-outline.svg',
  '**/send-outline.svg',
]
```

The broad pattern covers the app, the icons and a bundled `data.json`. The SVGs are the Ionic icons the menu, the player and the keypad use — listed one by one, because Ionic ships thousands of icons and precaching them all would bloat the download.

**If you add a menu item with a new icon, add its SVG here.** Otherwise it is missing offline, with no error and an empty button.

## Other build settings

```ts
globalStyle: 'src/global/app.scss',
globalScript: 'src/global/app.ts',
taskQueue: 'async',
plugins: [sass()],
```

`globalScript` runs before the app starts — that is where dark mode and the `theme-color` sync are set up.

## Service wiring

Runtime behaviour that is not in `stencil.config.ts` is in [`src/services/index.ts`](https://github.com/smartcompanion-app/audioguide-app/blob/main/src/services/index.ts): which audio player, which load service, and the `postMessage` listener. Changing those is a code change, not a setting. See [Architecture](./architecture.md#the-service-facade).

## What is not configurable

- **Routes and the menu.** Code, in `app-root.tsx`.
- **Which library pages are used.** Code, same file.
- **Forcing light or dark mode.** It follows the device; an embedding page can force it at runtime.
- **Analytics.** There is none.
- **Anything about content.** Stations, languages, texts and media are all in your `data.json`.
