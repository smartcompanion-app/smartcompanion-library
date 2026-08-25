---
'@smartcompanion/ui': patch
---

Keep every page's content clear of the Android navigation bar, not just
`sc-page-stations`. Under an edge-to-edge WebView Ionic applies the bottom
safe-area inset only in the components that own the bottom edge — in
`@ionic/core` 8.8 exactly `ion-footer`, `ion-tab-bar`, `ion-toast` and
`ion-picker-legacy`. `ion-content` has the hook but only `ion-modal` ever fills
it, so any routed page whose content reaches the bottom edge had its lowest
element obscured, `fullscreen` or not.

`sc-page-station-list`, `sc-page-station-image-list`, `sc-page-tour-list`,
`sc-page-station`, `sc-page-multi-audio-station`, `sc-page-pin`, `sc-page-error`
and `sc-page-language` now set `--padding-bottom` on their `ion-content` through
a shared mixin (`src/styles/_safe-area.scss`), which documents the mechanism and
the ways it can be got wrong. `sc-page-language` keeps its own 12px as the base
the inset is added to.

`sc-page-stations` moves from the one-off `#player-list { margin-bottom: … }` of
the previous release to that same general form; both measured identically on
device (list bottom at 875 on a 923px screen). Where the inset is zero —
browsers, Storybook, devices without a visible navigation bar — every one of
these rules is inert and the pages are unchanged.

Consumers can drop the `sc-page-stations #player-list { margin-bottom: … }`
workaround and any app-level `--padding-bottom: var(--ion-safe-area-bottom)`
block over these page tags.

`sc-page-tabbed-station-list` is deliberately unchanged: its inner pages pick the
inset up from the above, and that composes with the existing flat
`ion-list { margin-bottom: 56px }` rather than doubling up, since `ion-tab-bar`'s
real height under edge-to-edge is `56px + inset`. Worth confirming on device.

Still uncovered: `sc-page-selection` and `sc-page-map` put their content in
`slot="fixed"`, which `--padding-bottom` does not reach. The selection numpad is
centred and clears the bar, but MapLibre's attribution control does sit in the
navigation-bar strip and needs its own rule.
