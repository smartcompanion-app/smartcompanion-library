---
'@smartcompanion/services': minor
'@smartcompanion/ui': minor
---

Require `@smartcompanion/native-audio-player` 2. It renames the `skip` state to `skipped` and reports `stop()` as `stopped` instead of `paused`. `AudioPlayerService` follows the new names, and types `AudioPlayerUpdate.state` as the player's states, so a renamed state no longer goes unnoticed.

The player's `progress` event replaces polling the position. `registerUpdateListener()` reports it as a `progress` update with `position` and `duration`. The audio pages take their slider from it instead of asking every 800 ms, and `CollectibleAudioPlayerService` measures listening time from it instead of from `getPosition()`. A stop no longer carries listening time over into the next start.

A completed audio stays rewound on `sc-page-station` and `sc-page-multi-audio-station`. Their default rewound it again with a seek, which resumes playback, so the audio started over.

`registerUpdateListener()` replaces the listeners of an earlier registration, so a page that handed the player to the next one no longer leaves its listeners running, and `CollectibleAudioPlayerService` no longer counts the jump back to the start of a completed audio as listening time.
