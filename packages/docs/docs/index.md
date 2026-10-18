---
slug: /
---

# SmartCompanion

SmartCompanion is a free, open-source audioguide for museums, tourism and cultural institutions. Visitors open it in their phone's browser — from a QR code or a link — and listen their way through your stations. It is a [Progressive Web App](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps): no app store, no install required, and it can be added to the home screen and run offline.

<div className="sc-screenshots">
  <img src="/img/animals-app.png" alt="The Animals demo" />
  <img src="/img/leon-app.png" alt="The Leon demo" />
  <img src="/img/landeck-app.png" alt="The Schloss Landeck audioguide" />
  <img src="/img/tratzberg-app.png" alt="The Schloss Tratzberg audioguide" />
</div>

:::tip[Start here]

The [Quickstart](./quickstart.md) walks the whole path on one page, from forking the app to a branded audioguide on the web. To see what you are building first, try the [Animals](https://smartcompanion-app.github.io/audioguide-app/animals/) or the [Leon](https://smartcompanion-app.github.io/audioguide-app/leon/) demo on your phone.

:::

## What these docs cover

**Running an audioguide** — for anyone setting up a guide for a venue:

| Section | What is in it |
| --- | --- |
| [Quickstart](./quickstart.md) | Fork, brand, add content, deploy, test — the whole path on one page |
| [Content](./content/index.md) | The data format in full: stations, tours, languages, texts, media, PINs |
| [Customization](./customization/index.md) | Colours, logos, the app icon, and several branded variants in one repository |
| [Features](./features/index.md) | The screens, the audio player, offline mode, installing, embedding |
| [Deployment](./deployment/index.md) | GitHub Pages, Netlify, your own server, or a managed plan |
| [Reference](./reference/index.md) | Architecture, build settings, scripts, browser support, troubleshooting |

**Building on the library** — for developers writing their own app or changing the pages:

| Section | What is in it |
| --- | --- |
| [Library](./library/index.md) | `@smartcompanion/data`, `/services` and `/ui`: installing, the service facade, routing, the components |
| [Storybook](pathname:///storybook/) | Every UI component, with its props and events |

## How the pieces fit

| Project | What it is |
| --- | --- |
| [`audioguide-app`](https://github.com/smartcompanion-app/audioguide-app) | The app you fork and deploy. A thin shell: routes, menu, branding, build. |
| [`smartcompanion-library`](https://github.com/smartcompanion-app/smartcompanion-library) | The npm packages behind it — almost everything a visitor sees. This site lives there too. |
| [`data-format`](https://github.com/smartcompanion-app/data-format) | The JSON schema your content is written in, and the example data files. |
| [`native-audio-player`](https://github.com/smartcompanion-app/native-audio-player) | The Capacitor plugin for background playback and lock-screen controls. |
| [`engraft`](https://github.com/smartcompanion-app/engraft) | The tool that applies your branding to the app without editing its source. |

## Not a developer?

You do not have to be. Everything a visitor sees comes out of one JSON file, and [Content](./content/index.md) explains it from scratch. If you would rather not touch the technical side at all, SmartCompanion offers a [managed plan](./deployment/managed.md) with a content management system, hosting and support.
