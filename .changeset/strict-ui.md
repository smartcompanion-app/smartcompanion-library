---
'@smartcompanion/ui': patch
---

`sc-page-station`, `sc-page-station-image-list` (and with it `sc-page-tabbed-station-list`) and `sc-page-tour-list` render a station or tour without images instead of failing on it, and `sc-page-multi-audio-station` leaves out the duration of an audio that has none instead of showing `0NaN:0NaN`.

The props that default to `null` (`tourId`, `defaultBackButtonHref`, and `stationId` on `sc-page-stations`) are typed `string | null`.
