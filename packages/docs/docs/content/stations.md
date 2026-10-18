# Stations

A station is one stop on the tour: a number on a sign, a title, some pictures, and — usually — a voice. Everything else in the format exists to support them.

## The minimum

```json
{
  "id": "s1",
  "language": "en",
  "number": "1",
  "title": "The Great Hall",
  "images": ["image-1"],
  "audios": ["audio-1"]
}
```

`audios` is optional — see [Stations without audio](#stations-without-audio). `images` is not; every station needs at least one.

The complete field list is in [Data format](./data-format.md#stations). This page is about using the fields well.

## Numbering

`number` is a **string**, and it is the visitor-facing identity of the station. It appears on your signage and it is what the keypad matches.

Things to settle before the signs go to the printer:

- **The keypad matches exactly.** It compares what the visitor typed with `number` as a string, so a station numbered `"01"` is not found by typing `1`. Use plain numbers without leading zeros.
- **The keypad takes two digits by default.** Numbers up to 99 can be typed. A guide with more stations needs the `maxLength` property of `sc-page-selection` raised in your fork — see [Screens](../features/screens.md#selection).
- **Letters work, but not on the keypad.** `"7a"` is a valid number, but the keypad has no letters. Use such numbers only for stations visitors reach from the list.
- **Numbers need not be contiguous.** Gaps are fine.
- **`number` must be unique** among the stations of a language.

`id`, by contrast, is internal. Visitors never see it. It ties the language variants of a station together, and tours refer to stations by it — so keep ids stable when you renumber or reorder.

## Order

Station lists are sorted by `number`, read as a number: `2` comes before `10`. The order of entries in the `stations` array does not matter, and a number that does not start with a digit sorts as `0`, to the front.

The player's next and previous controls follow the same order, so the numbering is also the walking order. If you want a different route through the same stations, number them in that order.

## Images

`images` is an array of asset ids, and it drives the slideshow at the top of the station. Several images become a swipeable gallery; a single image is shown on its own.

```json
"images": ["hall-wide", "hall-ceiling", "hall-detail"]
```

Images are normally **shared between languages** — the same asset ids in the German and the English variant of a station. An image asset has no `language`, and there is no reason to duplicate a photograph per language.

The exception is an image containing text — a reproduced document, a diagram with labels. Those you want per language: declare separate assets and reference the right one in each variant.

Sizes, formats and compression are in [Media](./media.md#images).

## Audio

`audios` is an array of asset ids. Usually it holds exactly one — the narration for this station in this language:

```json
{ "id": "s1", "language": "de", "audios": ["a1de"] }
{ "id": "s1", "language": "en", "audios": ["a1en"] }
```

The audio asset carries its own `language`, and it should match the station variant that references it. Getting this crossed is a classic bug: the English station plays the German file, and nobody notices until a visitor complains.

### More than one track

A station can list several audio assets — a narration and an eyewitness account, a short and a long version. The library has a page for this, `sc-page-multi-audio-station`, which lets the visitor choose. The default app routes to the single-track station page; using the multi-track one is a change in your fork, see [Screens](../features/screens.md#pages-the-default-app-does-not-use).

### Stations without audio

Leave `audios` out, or set it to `[]`. You get a station with images, a title and a description, and no player. Useful for:

- A welcome or orientation panel
- A station whose recording is not ready yet
- A purely visual exhibit

## Text

| Field | Where it shows | Use it for |
| --- | --- | --- |
| `title` | Station list, station header | The name on the sign |
| `subtitle` | Under the title | A Latin name, a date, an artist, a room |
| `description` | With the station | A transcript, or context the audio does not cover |

`description` is plain text, not Markdown or HTML.

A description that repeats the audio is more useful than it sounds: it is what a visitor who is deaf, in a noisy room, or without headphones will read.

## Coordinates

`latitude` and `longitude` place a station on a map. They are optional, and the default app shows no map — the library's `sc-page-map` does, see [Screens](../features/screens.md#map).

Add them if you have them. They cost nothing and are tedious to backfill.

```json
"latitude": 47.2692,
"longitude": 11.4041
```

Decimal degrees, WGS 84 — what you get from right-clicking in most map applications.

## Multilingual stations

Every station is repeated once per language. Three stations in three languages is nine entries:

```json
{ "id": "s1", "language": "de", "number": "1", "title": "Bär",     "images": ["i11"], "audios": ["a1de"] },
{ "id": "s1", "language": "en", "number": "1", "title": "Bear",    "images": ["i11"], "audios": ["a1en"] },
{ "id": "s1", "language": "es", "number": "1", "title": "Oso",     "images": ["i11"], "audios": ["a1es"] },
{ "id": "s2", "language": "de", "number": "2", "title": "Elefant", "images": ["i21"], "audios": ["a2de"] }
```

`id`, `number` and `images` stay the same; `language`, `title`, `subtitle`, `description` and `audios` change.

Writing that by hand gets old around the second language. [Languages](./languages.md#generating-the-file) shows how to generate it from a spreadsheet.

## Common mistakes

<details>
<summary>A station is missing in one language</summary>

The app looks stations up in the selected language. A station absent from the Spanish set does not exist for a Spanish visitor — no error, no fallback. Run the [checklist script](./data-format.md#checklist).

</details>

<details>
<summary>The keypad cannot find a station</summary>

The keypad matches `number` exactly, as a string, and takes two digits by default. `"01"` is not found by typing `1`, and `"120"` cannot be typed at all.

</details>

<details>
<summary>The wrong language plays</summary>

The station variant references an audio asset recorded in another language. Check that `a1en` really is the English recording.

</details>

<details>
<summary>A station shows no images</summary>

`images` must have at least one entry, and every id in it must exist in `assets`. A typo in an id gives an empty slideshow rather than an error.

</details>
