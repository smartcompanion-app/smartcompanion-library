---
'@smartcompanion/ui': patch
---

`sc-page-station` renders a station without images instead of failing on it, and `sc-page-multi-audio-station` leaves out the duration of an audio that has none instead of showing `0NaN:0NaN`.

The props that default to `null` (`tourId`, `defaultBackButtonHref`) are typed `string | null`.
