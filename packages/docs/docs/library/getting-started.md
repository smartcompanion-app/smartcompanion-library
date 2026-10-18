# Getting started

The shortest path to an app of your own is forking the [audioguide app](https://github.com/smartcompanion-app/audioguide-app) — it is this page, done. Read on to understand what it does, or to build the shell from scratch.

## Install

```bash
npm install @smartcompanion/ui @smartcompanion/services @smartcompanion/data \
  @smartcompanion/native-audio-player @capacitor/core @ionic/core
```

| Requirement | |
| --- | --- |
| Node | 20 or newer |
| Ionic | 9 (`@ionic/core`) |
| Capacitor | 8 (`@capacitor/core`) |
| Audio | `@smartcompanion/native-audio-player` 1.0.2 or newer |

`services` declares `data`, `native-audio-player`, `@capacitor/core` and `@ionic/core` as peer dependencies, and `ui` declares `data` — the app installs them once, and every package uses the same copy.

:::note[`data` and `services` are ESM only]

Both declare `"type": "module"` and ship an `exports` map: `import` works from Node and from bundlers, `require()` does not. `ui` is unaffected — Stencil builds its own CommonJS, ESM and custom-elements outputs.

:::

## Wire up the facade

One `ServiceFacade` serves the whole app. It needs an audio player and a way to load the content; everything else it creates on first use.

```ts title="src/services/index.ts"
import { ServiceFacade } from '@smartcompanion/services';

export const serviceFacade = new ServiceFacade();

// The string is shown under the station title in the device's media controls.
serviceFacade.registerCollectibleAudioPlayerService('My Audioguide');

serviceFacade.registerOnlineLoadService(() => fetch('https://example.org/guide/data.json', { cache: 'no-store' }).then(response => response.json()));
```

The content is a file in the [data format](../content/data-format.md). For an app that works offline, register the offline load service instead — see [Data](./data.md#loading).

## Register the components

Importing the package registers every custom element:

```ts title="src/index.ts"
import '@ionic/core';
import '@smartcompanion/ui';
```

`defineCustomElements` from `@smartcompanion/ui/loader` is there for apps that register the elements themselves.

In a Stencil app, the compiler picks the components up from the package's `collection` and builds them along with the app's own. Any other framework — or none — uses the custom elements as they are.

## Route to the pages

Pages take the facade as their `facade` property. With Ionic's router, pass it through `componentProps`, and render into an `ion-router-outlet`:

```tsx title="src/components/app-root/app-root.tsx"
<ion-app>
  <ion-router useHash={true}>
    <ion-route url="/" component="sc-page-loading" componentProps={{ facade: serviceFacade, image: 'assets/logo.png' }} />
    <ion-route url="/language" component="sc-page-language" componentProps={{ facade: serviceFacade }} />
    <ion-route url="/stations/:stationId" component="sc-page-stations" componentProps={{ facade: serviceFacade }} beforeEnter={() => serviceFacade.canLoadRoute()} />
    <ion-route url="/pin" component="sc-page-pin" componentProps={{ facade: serviceFacade }} />
    <ion-route url="/error" component="sc-page-error" componentProps={{ facade: serviceFacade }} />
  </ion-router>

  <ion-menu contentId="main">…</ion-menu>
  <ion-router-outlet id="main" />
</ion-app>
```

`sc-page-loading` loads the content and moves on by itself — to `/language`, `/pin`, `/error`, or the page it was asked for. Its `homeRoute` property, `/stations/default` unless set, is where it goes when nothing was asked for. [Routing](./routing.md) explains the guard and navigating between pages.

Every page uses Ionic components, so the app has to load Ionic's styles; see the [Ionic documentation](https://ionicframework.com/docs/layout/global-stylesheets).

## Texts

Pages look up their interface texts through the facade, from the `texts` of your content. [UI components](./ui.md#texts) lists the keys each page uses.

## A complete example

The [audioguide app](https://github.com/smartcompanion-app/audioguide-app) is a complete, small app on the library: [`src/services/index.ts`](https://github.com/smartcompanion-app/audioguide-app/blob/main/src/services/index.ts) for the facade, [`src/components/app-root/app-root.tsx`](https://github.com/smartcompanion-app/audioguide-app/blob/main/src/components/app-root/app-root.tsx) for routes and menu. [Architecture](../reference/architecture.md) walks through it.
