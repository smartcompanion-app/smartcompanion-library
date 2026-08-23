---
'@smartcompanion/ui': patch
---

Stop `sc-page-stations` from restyling the rest of the app. Its stylesheet
selected `ion-header`, `ion-toolbar` and `ion-card` by bare element name, and
the page components declare neither `shadow` nor `scoped`, so those rules were
injected as global CSS and applied everywhere once the page had rendered.

The visible symptom was on `sc-page-selection`: `ion-header { position:
absolute }` took the header out of flow, so Ionic computed no offset for the
fullscreen content and the number input sat behind the toolbar wherever the
status bar contributes a safe-area inset. Browsers and Storybook were fine,
Android with edge-to-edge was not.

Every rule now lives under `sc-page-stations`, matching what `page-station.scss`
already does with `#station`. The page looks the same.

One knock-on worth knowing: `ion-card` on `sc-page-multi-audio-station` and
`sc-page-station-image-list` was picking up `margin-top: 0` and
`margin-bottom: 10px` from this leak, so those cards go back to Ionic's default
margins. Their spacing previously depended on whether the stations page had been
visited first.

`sc-page-selection` also drops the `margin-top: 50px` on its fixed-slot
wrapper. That offset existed to push the number input clear of the leaked
absolute header; with the header back in normal flow the content area already
starts below it, and the input keeps its own 50px top margin. The input sits
50px lower than the toolbar rather than 100px.
