# Features

What the app does, from the visitor's side and from yours.

| Page | What it covers |
| --- | --- |
| [Screens](./screens.md) | Every screen a visitor can reach, and the library pages the default app does not use |
| [Audio](./audio.md) | Playback, listening progress, background play and lock-screen controls |
| [Offline](./offline.md) | The service worker, what gets cached, and how updates reach a cached device |
| [PWA](./pwa.md) | Installing to the home screen, the manifest, dark mode |
| [Embedding](./embedding.md) | The `postMessage` API for driving the app inside an iframe |

## At a glance

| Feature | Configured by | Default |
| --- | --- | --- |
| Station playback | Your `data.json` | on |
| Several languages | `languages` in your data | one language, screen skipped |
| Station pictures | `images` per station — the default app needs two | on |
| Number keypad | Always available | on |
| Listening progress | Always on | on |
| PIN gate | `pins` in your data | off |
| Share sheet | `share` in your data | off |
| Offline caching | `offline_support` variable | off |
| Home-screen install | `manifest.json`, always present | on |
| Dark mode | Follows the device | on |
| Runtime theming from a host page | `messaging_support` variable | off once you apply a values file |
| Tours, map, multi-track stations | Library pages, routed in a fork | off |

## What it deliberately does not do

- **No backend, and so no analytics of its own.** Visitor numbers come from your web server's logs, or from whatever you add yourself.
- **No visitor accounts.** Progress is kept on the device and does not follow a person to another device.
- **No content editing in the app.** Content is a JSON file you publish. A CMS on top of that is what the [managed plan](../deployment/managed.md) provides.
- **No push notifications, beacons or indoor positioning.** Stations are reached by number or from the list.
- **No feedback or ratings.** Nothing is sent anywhere from the app.

That last group follows from the architecture: static files plus a JSON document, with nothing to talk to. It is also why data protection for a self-hosted deployment is simple to reason about — the app requests your content and nothing else.
