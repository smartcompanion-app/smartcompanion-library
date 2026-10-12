---
'@smartcompanion/ui': patch
---

Audio pages no longer stop each other's player. All of them drive the app's
single audio player, and leaving one stopped it -- even after the next page had
started it, which with `ion-router-outlet` is always the case, as the next page
is created before the previous one is removed. Only the page whose audio is
playing stops it now. Leaving a station page right after opening it also no
longer fails with "Item with id … doesn't exist".
