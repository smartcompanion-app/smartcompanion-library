# Audio

Playback is the point of the whole app, and the part most constrained by what mobile browsers allow.

## The player

The app registers a **collectible** audio player:

```ts title="src/services/index.ts"
serviceFacade.registerCollectibleAudioPlayerService(Env.TITLE);
```

"Collectible" means the player keeps track of how much of each station has been listened to. The visitor sees it as the ring around each station number filling up, so it is clear at a glance which stations they have already heard. The progress is stored on the device.

The string passed in is your app title. The device's media controls show the station title with it underneath.

The library also has a plain player without progress tracking, `registerDefaultAudioPlayerService()`. One of the two has to be registered; there is no default. See [Services](../library/services.md#the-audio-player).

## Controls

`sc-player-controls` gives the visitor play/pause, previous and next station, and a seek bar. Previous and next follow the station list, which is sorted by number — so the numbering on your signs is also the order of playback.

## Background playback and lock-screen controls

Audio continues when the visitor locks the phone or switches apps, and the lock screen shows the title and transport controls. That is what makes an audioguide usable — nobody wants to walk through a museum holding a lit screen.

This runs through [`@smartcompanion/native-audio-player`](https://github.com/smartcompanion-app/native-audio-player), a Capacitor plugin. In the browser it plays through an HTML audio element and the Media Session API; in a native app built with Capacitor it uses the platform's own audio session.

What the lock screen shows — the title, the artwork, whether the seek bar works — is up to the platform and varies. Test on iOS and Android.

:::tip[ID3 tags can leak onto the lock screen]

Some platforms prefer the MP3's own metadata. If the lock screen says `Track 03`, or the name of the studio that mastered the file, fix it at the source:

```bash
ffmpeg -i in.mp3 -map_metadata -1 -metadata title="1 – The Great Hall" -codec copy out.mp3
```

:::

## The autoplay rule

Mobile browsers do not start audio without a user gesture. The first play in a session must come from a tap. This is a platform rule and cannot be worked around:

- **A station does not start playing because the visitor navigated to it.** They tap play.
- **Do not design signage that implies audio starts by itself.** "Scan and press play" is honest; "scan to hear" sets up a support call.

## Progress

Progress is stored per station in the device's storage. It survives closing the tab and reopening the app, and it does **not** follow a visitor to another device — there are no accounts. Clearing the site's data resets it.

## Earpiece and speaker

In a native app, `sc-page-stations`, `sc-page-station` and `sc-page-multi-audio-station` can offer a switch between the phone's earpiece and its loudspeaker, with the `enableSwitchAudioOutput` property. Browsers choose the output themselves, so the default web app does not show it.

## Several tracks per station

`audios` is an array. Several assets on one station are the data side of alternative narrations — a short and a long version, an expert commentary, a children's track. The library's `sc-page-multi-audio-station` lets the visitor choose between them. The default app does not use it: its main screen plays a station's tracks one after the other, so offering the choice means adding that page's route in your fork. See [Screens](./screens.md#pages-the-default-app-does-not-use).

Give each asset a `title`; that is what the chooser shows.

## Stations without audio

The schema allows them, and so does the default app. Its main screen keeps such a station in the list with the play button disabled, and the player skips it when moving on — see [Stations](../content/stations.md#stations-without-audio).

## Preparing the files

The full treatment is in [Media](../content/media.md#audio). The short version:

- **MP3**, mono, around **64 kbps** for speech
- **Loudness-normalised** to about −16 LUFS, so visitors do not adjust the volume at every station
- **Two to four minutes** per station
- **Metadata** stripped or set correctly

## Headphones

Worth saying out loud on your signage or in a welcome station: an audioguide on a phone speaker is a nuisance to everyone else in the gallery. The app cannot detect or enforce it.

## Troubleshooting

<details>
<summary>Audio does not play at all</summary>

Open the asset URL directly in a browser. Then check CORS and range requests — see [Media](../content/media.md#the-four-requirements). A file that downloads but does not play is usually a codec problem; re-encode it to plain MP3.

</details>

<details>
<summary>It plays but cannot be scrubbed</summary>

Range requests do not work on your media host. `curl -I -H "Range: bytes=0-99" <url>` should return `206`.

</details>

<details>
<summary>The wrong language plays</summary>

The station variant references an audio asset in another language. See [Stations](../content/stations.md#audio).

</details>

<details>
<summary>Audio stops when the screen locks</summary>

Test the deployed app rather than the dev server, on a real device. If it persists, note the browser and OS version and open an issue — background audio behaviour is platform-specific and changes between OS releases.

</details>
