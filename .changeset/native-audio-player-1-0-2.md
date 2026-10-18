---
'@smartcompanion/services': patch
---

Require `@smartcompanion/native-audio-player` 1.0.2 or later. On the web, its `stop()` rejected with "Cannot read properties of undefined (reading 'id')" when it found an audio element but had no current item, which a page left while its player was starting could surface as an unhandled rejection.
