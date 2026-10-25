---
'@smartcompanion/ui': patch
'@smartcompanion/services': patch
---

`sc-page-stations` and `sc-page-station` support stations with a single image, without audio, or with several audios. A station with one image shows it on its card too. A station without audio stays in the list with the play button and seek bar disabled, and the player skips it. The pages map a station's position in the list to the playlist through its id, so a station with several audios no longer moves every later station onto the wrong track. `AudioPlayerService` answers the lookups this needs: `findIndexByStationId()` (-1 for a station without audio), `getNextIndexByStationId()` and `getPrevIndexByStationId()`, and `getPlayerItems()` no longer throws for a station without `audios`. The `AudioPlayer` contract in `@smartcompanion/ui` requires the three new methods.
