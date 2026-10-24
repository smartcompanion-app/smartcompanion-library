---
'@smartcompanion/data': patch
---

`OnlineLoadService` and `OfflineLoadService` now await the data update before selecting a language. A failing update no longer escapes `load()` as an unhandled rejection: it returns `'error'`, or `'home'` from the offline service when content is already loaded.
