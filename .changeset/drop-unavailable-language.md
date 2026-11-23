---
'@smartcompanion/data': minor
---

A chosen language that the data no longer offers is dropped when the data is loaded. Before, it stayed selected until the next start, so the app showed no stations and `TourService.getTours()` threw. Now the load services select the only remaining language, or return `language` when there are several.

`LanguageService` has a new method `unsetUnavailableLanguage()`.
