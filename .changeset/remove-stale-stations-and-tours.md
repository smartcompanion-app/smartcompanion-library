---
'@smartcompanion/data': patch
---

Stations and tours deleted on the server are removed from the storage. Before, a language whose stations were all removed, a removed language and data without tours kept their previous stations and tours, so the app showed deleted content and requested its missing audio.

A language that no longer has a default tour also loses its stored default tour id, so a route with the tour id `default` fails as it does on a fresh install instead of showing the previous default tour.
