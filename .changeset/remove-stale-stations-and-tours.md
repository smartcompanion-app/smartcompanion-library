---
'@smartcompanion/data': patch
---

Stations and tours deleted on the server are removed from the storage. Before, a language whose stations were all removed, a removed language and data without tours kept their previous stations and tours, so the app showed deleted content and requested its missing audio.
