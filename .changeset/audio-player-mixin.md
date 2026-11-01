---
'@smartcompanion/ui': patch
---

`sc-page-stations`, `sc-page-station` and `sc-page-multi-audio-station` share their audio player through a Stencil mixin again, in place of the `ReactiveAudioPlayer` helper. Their behaviour does not change. A Stencil app building these pages from the collection needs Stencil 4.44 or later: an older compiler drops the mixin's properties from a library's collection without an error, and the pages render blank. `@stencil/core >=4.44.0` is an optional peer dependency of `@smartcompanion/ui` for that reason.
