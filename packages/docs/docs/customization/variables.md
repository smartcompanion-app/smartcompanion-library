# Variables

Every variable declared in [`engraft.template.yml`](https://github.com/smartcompanion-app/audioguide-app/blob/main/engraft.template.yml). Set them in a values file and apply it:

```bash
npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml
```

**A variable you leave out is not reset.** Most variables have no default: leaving one out leaves the file it targets as it is — on a fresh checkout, that is the *Animals* demo's value. The few with a default are marked below.

## Identity

| Variable | Where it lands |
| --- | --- |
| `title` | `TITLE` in `stencil.config.ts`, the page `<title>`, `name` in the manifest |
| `title_short` | `short_name` in the manifest — the name under the home-screen icon |
| `description` | `<meta name="Description">` and `description` in the manifest |
| `lang` | `<html lang>` and `lang` in the manifest |

`title_short` has about 12 characters before iOS and Android truncate it under the icon. `title` shows in full in the browser tab and the install prompt, and is the source name in the device's media controls.

`lang` is the language of the app shell as declared to the browser and to screen readers. Set it to your primary language; it does not change which languages the guide offers.

## Behaviour

| Variable | Default | Where it lands |
| --- | --- | --- |
| `data_url` | — | `DATA_URL` in `stencil.config.ts` |
| `offline_support` | `"false"` | `OFFLINE_SUPPORT` in `stencil.config.ts` |
| `messaging_support` | `"false"` | `MESSAGING_SUPPORT` in `stencil.config.ts` |

:::warning[The switches are strings]

`offline_support: "true"`, with the quotes. engraft writes the value into a TypeScript source file, where it has to be the literal text `true` or `false`.

:::

**`data_url`** is where the app finds its content, in one of two forms:

- **An absolute URL** — `https://content.example.org/guide/data.json`. Reachable over HTTPS, with CORS allowed; see [Media](../content/media.md#2-cors).
- **A path inside the repository** — `customization/my-museum/data/data.json`, relative to the repository root. The folder it points into is copied into the build as `data/`, so the content ships with the app. See [Bundling the content with the app](../content/media.md#bundling-the-content-with-the-app).

**`offline_support`** adds the service worker to every build. See [Offline](../features/offline.md).

**`messaging_support`** installs a `postMessage` listener that lets a page embedding the app in an iframe change its colours, logos and palette at runtime. It is on in the *Animals* demo and off as soon as you apply a values file that does not ask for it. See [Embedding](../features/embedding.md).

## Colours

Two colours are named; the rest of the palette is computed from them at build time.

| Variable | Default | Description |
| --- | --- | --- |
| `background_color` | — | The page background in light mode. The whole palette derives from it. |
| `primary_color` | — | Your brand colour — buttons, active states, progress |
| `primary_color_contrast` | `"#ffffff"` | Text and icons drawn on top of `primary_color` |

Every other colour is **derived** unless you name it:

| Variable | Derived from |
| --- | --- |
| `background_color_dark` | `background_color`, same hue at 11 % lightness |
| `card_background_color` | `background_color`, one step off it |
| `card_background_color_dark` | `background_color_dark`, one step off it |
| `menu_border_color` | `background_color`, two steps off it |
| `menu_border_color_dark` | `background_color_dark`, two steps off it |
| `station_icon_progress_color` | `primary_color`, pushed away from the background |
| `station_icon_progress_color_dark` | `primary_color`, pushed away from the dark background |
| `light_color` | `background_color` |
| `light_color_dark` | `background_color_dark` |

[Colors](./colors.md) explains the derivation, when to override, and how to check the result.

## Images

| Variable | Relative to | What it does |
| --- | --- | --- |
| `logo` | the values file | Replaces `src/assets/logo.png` — loading screen and menu, light mode |
| `logo_dark` | the values file | Replaces `src/assets/logo-dark.png` — the same, dark mode |
| `icon_source` | the repository root | The one image the whole icon set is generated from |
| `icon_background_color` | — | Colour behind the padded icon artwork. Optional; sampled from the image when unset. |

Mind the two kinds of path. A values file at `customization/my-museum/engraft.variables.yml` with `logo: assets/logo.png` reads `customization/my-museum/assets/logo.png`, while `icon_source` is written out in full: `customization/my-museum/assets/app-icon-512.png`.

Sizes and the generated icon set: [Logos and icons](./logos-and-icons.md).

## A complete values file

```yaml title="customization/my-museum/engraft.variables.yml"
title_short: My Museum
title: My Museum Audioguide
description: An audioguide through the collection of My Museum
lang: en

data_url: customization/my-museum/data/data.json
offline_support: "true"
messaging_support: "false"

# The rest of the palette is derived from these two.
primary_color: "#8a3324"
background_color: "#f4efe7"
primary_color_contrast: "#ffffff"

logo: assets/logo.png
logo_dark: assets/logo-dark.png
icon_source: customization/my-museum/assets/app-icon-512.png
```

```
customization/my-museum/
├─ engraft.variables.yml
├─ assets/
│  ├─ logo.png
│  ├─ logo-dark.png
│  └─ app-icon-512.png
└─ data/
   ├─ data.json
   └─ assets/
```

## Verifying an apply

engraft edits your working tree, so `git diff` is the review:

```bash
npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml
git diff --stat
```

You should see changes in `stencil.config.ts`, `src/index.html`, `src/manifest.json`, `src/global/app.scss`, `scripts/generate-icons.mjs` and the two logo files. If a file you expected is untouched, check the variable's spelling — engraft does not warn about values the template does not declare.

## Adding a variable

To customize something the template does not cover:

1. **Extend `engraft.template.yml` in your fork.** The four actions — `json_replace`, `html_replace`, `regex_replace` and `file_replace` — are documented in the [engraft docs](https://smartcompanion-app.github.io/engraft/actions). A `regex_replace` needs a named `value` group:

   ```yaml
   - action: regex_replace
     file: stencil.config.ts
     replace:
       - selector: '(const MY_SETTING\s*=\s*")(?P<value>[^"]*)'
         variable: my_setting
   ```

2. **Contribute it upstream.** If other institutions would want it too, a pull request makes it a supported variable — and one less thing for you to carry across updates.
