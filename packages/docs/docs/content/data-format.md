# Data format

The complete reference for the SmartCompanion data format. The normative source is the JSON Schema:

- **v1.1** — <https://smartcompanion-app.github.io/data-format/v1.1/schema.json> (current)
- **v1.0** — <https://smartcompanion-app.github.io/data-format/v1.0/schema.json>

The specification and its examples live in [`smartcompanion-app/data-format`](https://github.com/smartcompanion-app/data-format).

## Versioning

The schema is versioned `major.minor`.

| Bump | Meaning |
| --- | --- |
| **minor** | Additive only. A file valid against `v1.0` is still valid against `v1.1`. |
| **major** | Breaking. A file valid against the old major may not validate against the new one. |

| Version | What it added |
| --- | --- |
| v1.0 | The core: `checksum`, `assets`, `stations`, `languages`, `texts`, plus optional `tours`, `pins` and `server`. |
| v1.1 | The optional `share` attribute — a URL for recommending the guide. |

There is no version field inside the file. A `v1.0` file is a valid `v1.1` file, so the app reads either.

## Top-level object

The document is a single JSON object. `additionalProperties` is `false`: any key not listed here is a validation error.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| [`checksum`](#checksum) | string | **yes** | Change-detection token |
| [`assets`](#assets) | array | **yes** | Every media file, with its URL. At least one. |
| [`stations`](#stations) | array | **yes** | The points of interest. At least one. |
| [`languages`](#languages) | array | **yes** | Selectable languages. At least one. |
| [`texts`](#texts) | array | **yes** | Interface strings. At least one. |
| [`tours`](#tours) | array | no | Groupings of stations |
| [`pins`](#pins) | array | no | Four-digit access codes |
| [`server`](#server) | array | no | Local server IPs for faster in-house downloads |
| [`share`](#share) | string | no | URL offered in the share sheet *(v1.1)* |

---

## `checksum`

```json
"checksum": "2026-10-01-001"
```

An arbitrary string the app uses to detect that the content changed.

The app keeps the content it loaded in the device's storage. On every start it fetches `data.json` again, but it only replaces what it stored when the `checksum` differs from the stored one. That holds online and offline alike.

**Change it every time you edit the file.** Any value works — a date, a counter, a git hash. What matters is that it differs from the previous one.

:::danger[The most common mistake]

Editing content and leaving `checksum` alone. Every visitor who opened the guide before keeps the old content, because as far as their device can tell nothing changed. If an update did not show up, check this first.

:::

---

## `assets`

Every downloadable file — audio, images — is declared once here and referenced by id elsewhere.

```json
{
  "id": "a1de",
  "language": "de",
  "title": "Der Bär",
  "duration": 92,
  "filename": "a1de.mp3",
  "externalUrl": "https://example.org/assets/a1de.mp3"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | **yes** | Unique across all assets. Referenced from `stations.images`, `stations.audios` and `tours.images`. |
| `filename` | string | **yes** | File name with extension, no path. The local name when cached offline. |
| `externalUrl` | string | **yes** | The URL the file is downloaded from — absolute, or relative to the app for [bundled content](./media.md#bundling-the-content-with-the-app). |
| `language` | string | no | Two- or three-letter code, e.g. `de`. Set it on audio; leave it off images. |
| `title` | string | no | Display title, e.g. an audio track name |
| `duration` | number | no | Length in seconds, so the player can show it before the file has loaded |

**Conventions worth following**

- Keep `filename` unique across the whole file. It becomes the name on disk in offline mode.
- Set `language` on audio, leave it off images. Images are normally shared between the language variants of a station.
- Fill in `duration` if you can — the player's progress display is then right from the start.

---

## `stations`

A station is a point of interest. **One entry per language**: the same `id` and `number`, a different `language`, `title` and `audios`.

```json
{
  "id": "s1",
  "language": "de",
  "number": "1",
  "title": "Bär",
  "subtitle": "Ursus arctos",
  "description": "Der Braunbär war …",
  "latitude": 47.2692,
  "longitude": 11.4041,
  "images": ["i11", "i12"],
  "audios": ["a1de"]
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | **yes** | Shared across the language variants of the same station |
| `language` | string | **yes** | Which language this variant is in. Pattern `^[a-z]{2,3}$`. |
| `number` | string | **yes** | What the visitor types on the keypad and reads on the sign. A **string**. |
| `title` | string | **yes** | Station name in this language |
| `images` | array of string | **yes** | Asset ids for the slideshow. At least one. |
| `subtitle` | string | no | Secondary line under the title |
| `description` | string | no | Longer text shown with the station |
| `audios` | array of string | no | Asset ids of the audio for this station in this language |
| `latitude` | number | no | −90 to 90. Only needed for a map. |
| `longitude` | number | no | −180 to 180 |

[Stations](./stations.md) covers the practical side — numbering, ordering, stations without audio.

---

## `languages`

```json
"languages": [
  { "language": "de", "title": "Deutsch" },
  { "language": "en", "title": "English" }
]
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `language` | string | **yes** | Code, pattern `^[a-z]{2,3}$` |
| `title` | string | **yes** | The language's name **written in that language** — `Deutsch`, not `German` |

With a single language, the app selects it and skips the language screen. With several, the visitor picks one on first launch — or the link they opened chose it already, see [Languages](./languages.md#preselecting-a-language).

---

## `texts`

Interface strings, as flat `(language, key, value)` triples.

```json
{ "language": "en", "key": "menu-overview", "value": "Overview" }
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `language` | string | **yes** | Code, pattern `^[a-z]{2,3}$` |
| `key` | string | **yes** | Identifier the app looks up |
| `value` | string | **yes** | Translated text |

Provide every key for every language you list. A missing key does not fail; the app shows the key itself instead, which a visitor will notice. [UI texts](./ui-texts.md) lists every key.

---

## `tours`

Optional. A tour groups stations into a route. Like stations, **one entry per language**.

```json
{
  "id": "tour1",
  "language": "de",
  "title": "Rundgang durch den Zoo",
  "description": "Ein Rundgang von 45 Minuten.",
  "number": "1",
  "default": true,
  "stations": ["s1", "s2", "s3"],
  "images": ["i11"]
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | **yes** | Shared across language variants |
| `language` | string | **yes** | Which language this variant is in |
| `title` | string | **yes** | Tour name in this language |
| `default` | boolean | **yes** | Exactly one tour should be `true` |
| `stations` | array of string | **yes** | The stations in this tour. At least one. |
| `images` | array of string | **yes** | Asset ids for the tour |
| `number` | string | no | Tour number, for visitors |
| `description` | string | no | Longer text |

:::warning[`tours.stations` holds station ids]

The library looks each entry up as a station **`id`**. The schema's description calls them station numbers; in data where ids and numbers coincide, as in most examples, the difference never shows. Where they differ, write ids.

:::

The default app does not show tours; they are used by apps that route to the tour pages. See [Tours](./tours.md).

---

## `pins`

Optional. Four-digit codes that gate access to the guide.

```json
"pins": ["1234", "5678"]
```

Each entry must match `^[0-9]{4}$`. If the array is present, the app shows a PIN screen after loading and continues only once the visitor enters one of the listed codes. A correct code is remembered on the device for six hours by default.

This is a turnstile, not a security control — the codes sit in a file anyone can download. See [Access and sharing](./access-and-sharing.md).

---

## `server`

Optional. IP addresses of servers on the venue's own network.

```json
"server": ["192.168.1.50"]
```

Meant for local downloads on the venue network. Two caveats: the default app does not use the list, and the library reads it from a key named **`servers`**, not `server` — so a file that follows the schema's spelling never delivers it. See [Access and sharing](./access-and-sharing.md#local-download-servers).

---

## `share`

*Added in v1.1.* Optional. A URL offered when the visitor uses the share item in the menu.

```json
"share": "https://guide.example.org/"
```

Normally the public URL of your deployment. The menu item only appears when this is set **and** the device can share. See [Access and sharing](./access-and-sharing.md#sharing).

---

## Checklist

A schema validator checks shape. These are the things it cannot check, and they are where the real bugs live:

- [ ] Every id in `stations.images` and `stations.audios` exists in `assets`
- [ ] Every id in `tours.images` exists in `assets`
- [ ] Every entry in `tours.stations` is an existing station `id`
- [ ] Every station exists in **every** language listed in `languages`
- [ ] Every `texts` key exists in every language
- [ ] Every `externalUrl` loads over HTTPS, with CORS allowed if it is on another host — see [Media](./media.md)
- [ ] `checksum` differs from the previously published version
- [ ] Exactly one tour has `"default": true`, if you use tours

A short script covers the reference checks:

```python title="check.py"
import json
import sys

d = json.load(open(sys.argv[1], encoding="utf-8"))
asset_ids = {a["id"] for a in d["assets"]}
languages = {l["language"] for l in d["languages"]}
station_ids = {s["id"] for s in d["stations"]}
problems = []

for s in d["stations"]:
    for ref in s.get("images", []) + s.get("audios", []):
        if ref not in asset_ids:
            problems.append("station %s/%s references unknown asset %s" % (s["id"], s["language"], ref))

for t in d.get("tours", []):
    for ref in t["stations"]:
        if ref not in station_ids:
            problems.append("tour %s references unknown station %s" % (t["id"], ref))
    for ref in t["images"]:
        if ref not in asset_ids:
            problems.append("tour %s references unknown asset %s" % (t["id"], ref))

by_language = {}
for s in d["stations"]:
    by_language.setdefault(s["language"], set()).add(s["id"])
for language in languages:
    for missing in sorted(station_ids - by_language.get(language, set())):
        problems.append("station %s missing in %s" % (missing, language))

keys = {t["key"] for t in d["texts"]}
for language in languages:
    present = {t["key"] for t in d["texts"] if t["language"] == language}
    for missing in sorted(keys - present):
        problems.append("text %s missing in %s" % (missing, language))

print("\n".join(problems) or "no problems found")
```

```bash
python check.py data.json
```
