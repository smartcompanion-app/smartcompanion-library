---
'@smartcompanion/ui': patch
---

Keep the `sc-page-stations` list clear of the Android navigation bar. The page
renders `<ion-content fullscreen>`, so it spans the whole screen, and Ionic
applies the bottom safe-area inset only to content inside a modal. The station
list therefore ran to the bottom of the screen and its last card sat under the
navigation bar — permanently, since the list is a vertical swiper whose viewport
ended there too, so scrolling could not bring the card into view.

`#player-list` now carries `margin-bottom: var(--ion-safe-area-bottom, 0px)`.
This has to be a margin rather than padding: swiper sizes its viewport from the
container's `clientHeight`, which includes padding, so `padding-bottom` would
leave the container reaching the bottom of the screen and the slides would
simply extend into the padded region.

Consumers carrying the `sc-page-stations #player-list { margin-bottom: ... }`
workaround can drop it. Where the inset is zero — browsers, Storybook, devices
without a visible navigation bar — the rule is inert and the page is unchanged.
