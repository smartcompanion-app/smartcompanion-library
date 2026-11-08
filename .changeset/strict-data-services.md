---
'@smartcompanion/services': patch
---

`AudioPlayerService` passes an empty `audioUri`/`imageUri` for an audio or station without a file, instead of leaving it out. The Android player reads every uri as required, so a station without an image dropped its audios and every audio after it from the player.

`CollectibleAudioPlayerService` no longer throws when a progress arrives after `unregisterUpdateListener()`. `RoutingService` reports a missing `ion-router` by name.
