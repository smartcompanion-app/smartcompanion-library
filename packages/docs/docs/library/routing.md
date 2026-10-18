# Routing

Apps render their pages into an `ion-router-outlet`, driven by Ionic's `ion-router`. `RoutingService` from `@smartcompanion/services` navigates on top of it.

```tsx
<ion-router useHash={true}>
  <ion-route url="/" component="sc-page-loading" componentProps={{ facade }} />
  <ion-route url="/stations/:stationId" component="sc-page-stations" componentProps={{ facade }} beforeEnter={() => facade.canLoadRoute()} />
  {/* … */}
</ion-router>

<ion-router-outlet id="main" />
```

:::warning[Not `ion-nav`]

Library 1.x, on Ionic 8, had `ion-router` drive an `ion-nav`. Ionic 9 removed that integration — an app still set up that way renders an empty page. Library 2.x needs an `ion-router-outlet`.

:::

## The page stack is the browser history

The outlet holds only the current page, so `RoutingService` keeps no stack of its own: the stack is the browser's history.

| Method | What it does |
| --- | --- |
| `push(uri)` | Navigates to `uri` on a new history entry, with a forward transition |
| `replace(uri)` | Navigates to `uri` in place of the current entry, also with a forward transition |
| `back(fallbackUri = '/')` | Goes back with a back transition — or, when there is no earlier page of the app, to `fallbackUri` |
| `canGoBack()` | Whether `back()` has an earlier page of the app to return to |
| `addRouteChangeListener(to, callback)` | Calls `callback` when a navigation reaches `to` — a route, or a prefix ending in `*` |

**Push or replace?** `push()` for going deeper — from a list to a station. `replace()` for pages that must not be returned to — the loading page, the language selection, the PIN entry, the error page — and for the menu, whose items are destinations rather than steps.

**`back()` and deep links.** A visitor who opens `#/stations/3` from a QR code has no earlier page in the app; going back would leave the site. `back()` goes to `fallbackUri` instead, which is why it takes one.

The Android back button and the browser's own back navigation are history navigations too, so `canGoBack()` stays right whichever way the visitor goes back.

### From library 1.x

| 1.x | 2.x |
| --- | --- |
| `pushReplace(uri)` | `replace(uri)` |
| `pushReplaceCurrent(uri)` | `replace(uri)` |
| `pop()` | `back(fallbackUri)` |

## Back buttons

Pages with a back button use `ion-back-button` with `default-href="#"`. Ionic only shows a back button when there is an `ion-nav` or a `default-href`, and ignores an href starting with `#` — so the button is shown, and its click is left to the page, which calls `back()`.

`sc-page-station` and `sc-page-map` offer one, with `enableBackButton` and, for the fallback, `defaultBackButtonHref`:

```tsx
<ion-route
  url="/stations/:stationId"
  component="sc-page-station"
  componentProps={{ facade, enableBackButton: true, defaultBackButtonHref: '/stations' }}
  beforeEnter={() => facade.canLoadRoute()}
/>
```

## Guards

`facade.canLoadRoute()` in `beforeEnter` sends a visitor to `/` while the content is not loaded, and remembers where they wanted to go; `sc-page-loading` continues there afterwards. Use it on every route that shows content. See [Services](./services.md#the-route-guard).

## The menu and navigation

Close the menu before navigating, and navigate with `replace()`:

```ts
async navigate(route: string) {
  await facade.getMenuService().close();

  // already on the stations page: nothing to do
  if (!(route == 'stations/default' && /#\/stations\/.+/.exec(window.location.hash))) {
    await facade.getRoutingService().replace(`/${route}`);
  }
}
```

A listener on every route keeps app-level state such as menu labels current, including after a language change:

```ts
facade.getRoutingService().addRouteChangeListener('/*', () => this.update());
```
