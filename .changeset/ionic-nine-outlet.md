---
'@smartcompanion/services': major
'@smartcompanion/ui': major
---

Move to Ionic 9. Ionic 9 no longer lets `ion-router` drive an `ion-nav`, so an app
built that way renders an empty page. Routing now goes through
`ion-router-outlet`, which holds only the current page; the page stack is the
browser history.

Migrating an app:

- Replace `<ion-nav id="main" />` with
  `<ion-router-outlet swipeGesture={false} id="main" />`. The `<ion-route>`
  definitions stay as they are. Swipe-to-go-back is gone either way: in a
  Stencil app nothing hands the outlet a swipe handler. `swipeGesture={false}`
  states that, and keeps it off should Ionic ever wire one up.
- Update `@ionic/core` to `^9.0.0` (the peer range of `@smartcompanion/services`).
- `RoutingService.pushReplace()` and `pushReplaceCurrent()` are both
  `replace()`, and `pop()` is `back()`. `replace()` overwrites the current
  history entry, so back never returns to the loading,
  language, pin or error page.
- Code that asked `ion-nav` for the active page, e.g. an Android `backButton`
  listener calling `document.querySelector('ion-nav').getActive()`, asks the
  outlet instead: `(await document.querySelector('ion-router-outlet').getRouteId())?.element.localName`
  is the tag of the page on screen.
- Custom facades passed to `sc-page-station`, `sc-page-stations` or
  `sc-page-multi-audio-station` need `getRoutingService()`; `ServiceFacade`
  already has it.

Back buttons now follow the history: a station opened from the map returns to
the map, one opened from a list returns to the list. Where there is nothing to
go back to, e.g. after a deep link, they go to `defaultBackButtonHref`, or to
`/`. Before, `sc-page-station` and `sc-page-multi-audio-station` showed no back
button at all in that case.

What changes for users: going back rebuilds the previous page, because the
outlet does not keep it, so a list returns to its top and a tabbed list to its
first tab. Page transitions stay as they were: pushing a page, going back,
and the menu, language selection and leaving the loading page all animate.

`MenuService` now drives the `ion-menu` element instead of importing Ionic's
`menuController`. Under Ionic 9 that import resolved to a second controller
that no menu registers with, so the menu stayed open after choosing an entry.
