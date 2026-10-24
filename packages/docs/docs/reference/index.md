# Reference

The technical detail behind the rest of the documentation.

| Page | What it covers |
| --- | --- |
| [Architecture](./architecture.md) | What lives in the app, what lives in the library, and where to change what |
| [Configuration](./configuration.md) | `stencil.config.ts`, the `Env` values, and the service wiring |
| [Scripts](./scripts.md) | Every npm script of the app, and its two test modes |
| [Browser support](./browser-support.md) | Which devices are supported, and what to do about older ones |
| [Versioning](./versioning.md) | CalVer for the app, semver for the library, and how to tell what a device runs |
| [Troubleshooting](./troubleshooting.md) | Symptoms, causes, fixes |

## Repositories

| Repository | What it holds |
| --- | --- |
| [`audioguide-app`](https://github.com/smartcompanion-app/audioguide-app) | The shell application. What you fork. |
| [`smartcompanion-library`](https://github.com/smartcompanion-app/smartcompanion-library) | `@smartcompanion/ui`, `/services` and `/data` — almost everything a visitor sees — and this documentation |
| [`data-format`](https://github.com/smartcompanion-app/data-format) | The JSON schema and the example data files |
| [`native-audio-player`](https://github.com/smartcompanion-app/native-audio-player) | The Capacitor audio plugin — background playback, lock-screen controls |
| [`engraft`](https://github.com/smartcompanion-app/engraft) | The customization tool |

## External documentation

| | |
| --- | --- |
| [Storybook](pathname:///storybook/) | Every UI component, with its properties and events |
| [Data format specification](https://smartcompanion-app.github.io/data-format) | The schema, readable |
| [engraft](https://smartcompanion-app.github.io/engraft/) | The customization tool |
| [Stencil](https://stenciljs.com/docs/introduction) | The web component compiler |
| [Ionic Framework](https://ionicframework.com/docs) | The component and routing layer |
| [Workbox](https://developer.chrome.com/docs/workbox/) | The service worker toolkit |
| [Capacitor](https://capacitorjs.com/docs) | The native bridge, used for audio and sharing |

## Technology

| | |
| --- | --- |
| Framework | Stencil 4 — JSX with an `h` factory, compiled to standard web components |
| UI | Ionic Framework 9 |
| Language | TypeScript, ES2022 |
| Styling | Sass with CSS custom properties, prefixed `--sc-` |
| Service worker | Workbox 7, generated only with offline support |
| Tests | WebdriverIO with Mocha, driving Chrome through `puppeteer-core` |
| Package manager | npm |
| Node | 22 |
| Licence | BSD 2-Clause |
