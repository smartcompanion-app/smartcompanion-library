---
'@smartcompanion/services': major
'@smartcompanion/ui': major
---

Move to Ionic 9. Ionic 9 no longer lets `ion-router` drive an `ion-nav`, so an app
built that way renders an empty page. Routing now goes through
`ion-router-outlet`, which holds only the current page; the page stack is the
browser history.

Migrating an app:

- Replace `<ion-nav id="main" />` with `<ion-router-outlet id="main" />`. The
  `<ion-route>` definitions stay as they are. A `swipeGesture` attribute can
  stay but has no effect: in a Stencil app nothing hands the outlet a swipe
  handler, so swipe-to-go-back is gone.
- Update `@ionic/core` to `^9.0.0` (the peer range of `@smartcompanion/services`).
- `RoutingService.pushReplace()` and `pushReplaceCurrent()` are both
  `replace()`, and `pop()` is `back()`. `replace()` overwrites the current
  history entry without a transition, so back never returns to the loading,
  language, pin or error page.
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
first tab. Navigation by `replace()` -- the menu, and leaving the loading,
language, pin and error pages -- switches without a transition.
