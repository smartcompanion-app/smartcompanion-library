# Quickstart

This guide sets up your own audioguide for your venue, from start to finish: fork the app, brand it, add your content, put it on the web and test it on a phone.

No prior knowledge of the project is needed, though a basic familiarity with the command line and git is assumed. The quickstart does not cover every detail; each step links to the section that does.

:::tip[Try it before you build it]

Open one of the demos on your phone to see what you are about to build: [Animals](https://smartcompanion-app.github.io/audioguide-app/animals/) (three languages, content hosted elsewhere) or [Leon](https://smartcompanion-app.github.io/audioguide-app/leon/) (a German town walk, content bundled with the app).

:::

## Before you start

| Tool | Notes |
| --- | --- |
| [Node.js](https://nodejs.org/) | Version 22 or newer |
| [Git](https://git-scm.com/) | To clone the repository and pull updates later |
| A code editor | [VS Code](https://code.visualstudio.com/) is a fine default |
| A GitHub account | Free, to fork the project |

Check that the tools are on your command line:

```bash
node --version   # v22.x or newer
npm --version
git --version
```

## Step 1 — Get the app running

Fork [`smartcompanion-app/audioguide-app`](https://github.com/smartcompanion-app/audioguide-app) on GitHub, then:

```bash
git clone https://github.com/<your-account>/audioguide-app.git
cd audioguide-app
npm install
npm start
```

`npm start` serves the app at <http://localhost:3333> and rebuilds on every save. What you see is the *Animals* demo: three stations in German, English and Spanish, loaded from a [data file](https://smartcompanion-app.github.io/data-format/v1.1/animals/data.json) hosted elsewhere.

:::info[Fork, or download a copy?]

Fork. A fork keeps a link to the original repository, so fixes and new features reach you with a `git merge` — see [Step 7](#step-7--keep-it-running). A downloaded copy has to be updated by hand.

:::

:::tip[Look at it on a phone early]

The guide is made for phones. If your phone is on the same Wi-Fi as your computer, `http://<your-computer-ip>:3333` usually just works.

:::

## Step 2 — Brand it

Branding goes through [engraft](https://github.com/smartcompanion-app/engraft), which is already a devDependency of the app. You write your choices — title, colours, logo, icon, where the content lives — into a small values file, and engraft writes them into the app's source files for you.

:::warning[Do not edit the source files directly]

You *can* change the title in `stencil.config.ts` by hand, and it works. But each such edit is a change to a file the upstream project also changes, so every update you pull later turns into a merge conflict. With engraft your branding lives in a folder upstream never touches.

:::

The repository ships a second example, *Leon*, in `customization/leon/`. Start your own variant from it:

```bash
mkdir -p customization/my-museum
cp customization/leon/engraft.variables.yml customization/my-museum/
cp -r customization/leon/assets customization/my-museum/
```

Then edit the values file:

```yaml title="customization/my-museum/engraft.variables.yml"
title_short: My Museum
title: My Museum Audioguide
description: An audioguide through the collection of My Museum
lang: en
data_url: customization/my-museum/data/data.json

# The rest of the palette is derived from these two.
primary_color: "#8a3324"
background_color: "#f4efe7"

logo: assets/logo.png
logo_dark: assets/logo-dark.png
icon_source: customization/my-museum/assets/app-icon-512.png
```

Replace the images in `customization/my-museum/assets/` with your own:

- `logo.png`, and a `logo-dark.png` you add — a transparent PNG about 600 px wide, for light and dark mode. If one logo works on both backgrounds, point both variables at the same file, as *Leon* does.
- `app-icon-512.png` — one square image, at least 512 × 512 px. The whole icon set — home-screen icons, the maskable Android icon, the Apple touch icon and the favicon — is generated from it on every build.

Mind the two kinds of path: `logo` and `logo_dark` are relative to the values file, while `icon_source` and `data_url` are relative to the repository root. [Variables](./customization/variables.md) lists every variable and what it changes.

Apply it:

```bash
npx engraft apply \
  --template engraft.template.yml \
  --values customization/my-museum/engraft.variables.yml
```

`data_url` now points at a `data.json` you write in the next step; until it exists, the app has no content to load. Change the values file as often as you like and apply it again until the branding is right — engraft rewrites the same files each time.

## Step 3 — Write your content

The entire content of your guide is one file, `data.json`: the languages, the stations, the audio and images they use, and every text the interface shows. Keep it next to your branding, with the audio and images beside it:

```
customization/my-museum/
├─ engraft.variables.yml
├─ assets/                 # branding: logo, icon
└─ data/
   ├─ data.json            # your content
   └─ assets/              # your media
      ├─ station-1.mp3
      ├─ station-1.jpg
      ├─ station-2.mp3
      └─ station-2.jpg
```

Because `data_url` is a path inside the repository, the `data/` folder is copied into the build and served from `data/` next to the app — one deployment, no second host. That is why the asset URLs below start with `data/`, whatever the folder is called in the repository. [Media](./content/media.md#bundling-the-content-with-the-app) explains the alternative of hosting the content somewhere else.

A minimal file with two stations in one language:

```json title="customization/my-museum/data/data.json"
{
  "checksum": "2026-10-01-001",
  "languages": [{ "language": "en", "title": "English" }],
  "assets": [
    { "id": "audio-1", "language": "en", "filename": "station-1.mp3", "externalUrl": "data/assets/station-1.mp3" },
    { "id": "image-1", "filename": "station-1.jpg", "externalUrl": "data/assets/station-1.jpg" },
    { "id": "audio-2", "language": "en", "filename": "station-2.mp3", "externalUrl": "data/assets/station-2.mp3" },
    { "id": "image-2", "filename": "station-2.jpg", "externalUrl": "data/assets/station-2.jpg" }
  ],
  "stations": [
    { "id": "s1", "language": "en", "number": "1", "title": "The Great Hall", "subtitle": "Where it all begins", "images": ["image-1"], "audios": ["audio-1"] },
    { "id": "s2", "language": "en", "number": "2", "title": "The Library", "images": ["image-2"], "audios": ["audio-2"] }
  ],
  "texts": [
    { "language": "en", "key": "menu-overview", "value": "Overview" },
    { "language": "en", "key": "menu-selection", "value": "Enter number" },
    { "language": "en", "key": "menu-language", "value": "Language" },
    { "language": "en", "key": "no-internet", "value": "The audioguide could not be loaded" },
    { "language": "en", "key": "try-again", "value": "Try again" }
  ]
}
```

Four things worth understanding before you scale this to thirty stations:

- **Assets are referenced, not inlined.** Every audio file and image is an entry in `assets` with a unique `id`, and stations point at those ids. Audio carries a `language`; images do not, because one photo serves every language.
- **A station is repeated once per language.** Three languages means three entries sharing the same `id` and `number`, each with its own `language`, `title` and `audios`. See [Languages](./content/languages.md).
- **`number` is what the visitor types.** It is the number on your signage, matched exactly on the keypad. The `id` is internal.
- **`images` is required, `audios` is not.** Every station needs at least one image; a station without audio is a valid intro or title card.

:::warning[Change the `checksum` on every edit]

It is how the app notices that your content changed. Leave it the same and visitors with a cached copy keep the old content. A date plus a counter works well. See [Data format](./content/data-format.md#checksum).

:::

Now apply engraft again if you have not since Step 2, restart `npm start`, and your own guide appears. The full field reference is in [Data format](./content/data-format.md), and [UI texts](./content/ui-texts.md) lists every interface text the app looks up.

## Step 4 — Build it

```bash
npm run build
```

The finished app is in `www/`: HTML, JavaScript, CSS, the manifest, the icons and your bundled content. It is a static site — no server-side code, no database — and any static host can serve it. If visitors should be able to use the guide without a connection, set `offline_support: "true"` in your values file first; see [Offline](./features/offline.md).

## Step 5 — Deploy it

Any static hosting works; [Deployment](./deployment/index.md) compares the options. [Netlify](./deployment/netlify.md) is an easy start: it has a free plan, builds private repositories, and redeploys on every push. Its free plan has a monthly bandwidth limit, which is usually enough for a smaller venue.

1. Sign in to [Netlify](https://app.netlify.com) with your GitHub account.
2. Add a new project and import your fork.
3. Set the build settings:

   | Setting | Value |
   | --- | --- |
   | Build command | `npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml && npm run build` |
   | Publish directory | `www` |

4. Deploy.

From now on every push to your `main` branch builds and deploys the guide. Netlify gives you an address like `my-museum-123.netlify.app`; under **Domain management** you can point your own domain at it, for example `audioguide.my-museum.org`.

## Step 6 — Test it on a real phone

Before you print the QR codes, on an actual phone, on mobile data:

- [ ] Every station plays, in every language you offer
- [ ] Images load and the slideshow swipes
- [ ] The keypad finds every station by its `number`
- [ ] Light and dark mode both look right
- [ ] The icon and name look right when the guide is added to the home screen
- [ ] Audio keeps playing when the screen locks, and the lock-screen controls work
- [ ] With offline support: load it once, switch to flight mode, walk the whole tour
- [ ] It works on iOS Safari *and* Android Chrome — see [Browser support](./reference/browser-support.md)

The venue's Wi-Fi is not the test. Visitors arrive on whatever signal the building has.

## Step 7 — Keep it running

**Content and branding changes** need a new build and deploy. With Netlify that happens on every push. When you edit `data.json`, change its `checksum`, so visitors with a cached copy pick up the new version.

**Upstream updates** arrive through your fork's link to the original repository:

```bash
git remote add upstream https://github.com/smartcompanion-app/audioguide-app.git
git fetch upstream
git merge upstream/main
```

Because your branding and content live in `customization/my-museum/`, a directory upstream never touches, those merges stay quiet. Apply engraft again afterwards and rebuild. Releases use [CalVer](./reference/versioning.md), so read the changelog rather than the version number: anything that affects a fork's customization is described there.

## Where to go next

| | |
| --- | --- |
| [Content](./content/index.md) | The data format in full — stations, tours, languages, texts, media, PINs and sharing |
| [Customization](./customization/index.md) | Every variable, how the colours are derived, the logo and icon, several variants in one repository |
| [Features](./features/index.md) | The screens, the audio player, offline mode, installing, embedding |
| [Deployment](./deployment/index.md) | GitHub Pages, Netlify, your own server, or a managed plan |
| [Reference](./reference/index.md) | Architecture, build settings, scripts, browser support, troubleshooting |

:::info[Stuck?]

Ask in the [GitHub discussions](https://github.com/orgs/smartcompanion-app/discussions). SmartCompanion also offers custom support — [get in touch](https://www.smartcompanion.app/).

:::
