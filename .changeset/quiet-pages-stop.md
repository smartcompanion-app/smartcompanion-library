---
'@smartcompanion/ui': patch
---

Leaving a station page right after opening it no longer fails with "Item with
id … doesn't exist". The page's player was stopped while it was still
starting, and starting went on to select an audio the stopped player no longer
had; it now stops instead, without registering a listener that would outlive
the page.
