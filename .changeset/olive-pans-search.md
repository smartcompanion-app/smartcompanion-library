---
'@smartcompanion/services': minor
---

Move to `@smartcompanion/native-audio-player` 1.0, its first stable release.
The peer range is now `^1.0.0`; 0.5.x is no longer accepted, so an app has to
upgrade the plugin alongside this package.

The plugin renamed its player event from `update` to `audioPlayerChange`, and
`AudioPlayerService` follows. The payload is unchanged — the same `state` of
`playing`, `paused`, `skip` or `completed`, and the same `id` — so
`registerUpdateListener` still reports exactly what it did before, and nothing
in this package's own API changes.

Two behaviour changes come from the plugin itself and are worth knowing about,
since they are visible to an app without it calling anything:

- **iOS now starts on the speaker** rather than the earpiece, matching Android.
  An app that relied on the earpiece default has to call `setEarpiece()` after
  `start()` to keep it.
- **Playback the system stops** — an incoming call, Siri, another app taking
  the audio — is now reported as `paused`, where previously it stopped silently
  and left an app's own UI showing the wrong control.

`getPosition()` and `getDuration()` also report fractional seconds on every
platform now, rather than truncating to whole seconds on iOS and Android. Both
still return a `number`, and `formatSeconds` in `@smartcompanion/ui` already
truncates, so displayed times are unaffected; a progress bar simply moves
smoothly on the two platforms where it previously stepped.
