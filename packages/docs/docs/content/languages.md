# Languages

A guide can offer any number of languages from a single data file. Visitors pick one on first launch and can change it from the menu at any time.

## Declaring them

```json
"languages": [
  { "language": "de", "title": "Deutsch" },
  { "language": "en", "title": "English" },
  { "language": "es", "title": "Español" },
  { "language": "it", "title": "Italiano" }
]
```

**`title` is the language's name in that language** — `Deutsch`, not `German`; `Español`, not `Spanish`. A visitor who reads no English still has to find their language in the list.

`language` is a two- or three-letter code (`^[a-z]{2,3}$`). Use [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) where one exists — `de`, `en`, `fr`, `it`, `es`, `nl`, `pl`, `cs`, `zh`, `ja` — and the three-letter ISO 639 codes for languages without one. Regional codes such as `de-at` do not match the pattern. The codes are yours to choose, as long as `languages`, `stations`, `texts` and the audio `assets` use the same one.

## How a language gets chosen

When the guide loads and the visitor has not chosen a language yet:

1. If the URL carries `?language=<code>` for a language you offer, that language is selected.
2. If you offer exactly one language, it is selected.
3. Otherwise the visitor is shown the language screen.

The choice is stored on the device, so the language screen appears once. The order of `languages` is the order on that screen.

### Preselecting a language

The `language` query parameter is useful for printed material: a QR code on the English leaflet can open the guide in English directly.

```
https://guide.example.org/?language=en
```

The parameter only applies when no language has been chosen yet; it does not override a visitor's earlier choice.

## What has to be translated

| Part of the file | Repeated per language? |
| --- | --- |
| `stations` | **Yes** — one entry per station per language |
| `tours` | **Yes** — one entry per tour per language |
| `texts` | **Yes** — one entry per key per language |
| Audio `assets` | **Yes** — one file per station per language, tagged with `language` |
| Image `assets` | No — shared, unless the image contains text |
| `pins`, `server`, `share`, `checksum` | No — global |

## A single language

Perfectly valid:

```json
"languages": [{ "language": "de", "title": "Deutsch" }]
```

The app selects it automatically, skips the language screen and hides the language item in the menu. A monolingual guide costs the visitor nothing.

## Adding a language later

Adding a language is additive: nothing existing changes.

1. Append it to `languages`.
2. Add the audio assets, each with the new `language` code.
3. Add a copy of every station with the new `language`, referencing the new audio and the **existing** image ids.
4. Add a copy of every tour, if you have tours.
5. Add every `texts` key in the new language — see [UI texts](./ui-texts.md).
6. **Change the `checksum`.**

Then run the [checklist script](./data-format.md#checklist), which tells you exactly what you forgot.

## Generating the file

Writing the same station out five times by hand is where mistakes come from. Keep the content in a spreadsheet and generate the JSON.

A workable sheet:

| number | id | image ids | de\_title | de\_audio | en\_title | en\_audio |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | s1 | i11,i12 | Bär | a1de | Bear | a1en |
| 2 | s2 | i21,i22 | Elefant | a2de | Elephant | a2en |

Export it as CSV and expand it:

```python title="build.py"
import csv
import json

LANGUAGES = [("de", "Deutsch"), ("en", "English")]
BASE = "data/assets"  # or an absolute URL, for content hosted elsewhere

rows = list(csv.DictReader(open("stations.csv", encoding="utf-8")))

stations = []
assets = {}

for row in rows:
    image_ids = row["image ids"].split(",")
    for image_id in image_ids:
        assets[image_id] = {
            "id": image_id,
            "filename": image_id + ".jpg",
            "externalUrl": BASE + "/" + image_id + ".jpg",
        }
    for code, _ in LANGUAGES:
        audio_id = row[code + "_audio"]
        assets[audio_id] = {
            "id": audio_id,
            "language": code,
            "filename": audio_id + ".mp3",
            "externalUrl": BASE + "/" + audio_id + ".mp3",
        }
        stations.append(
            {
                "id": row["id"],
                "language": code,
                "number": row["number"],
                "title": row[code + "_title"],
                "images": image_ids,
                "audios": [audio_id],
            }
        )

data = {
    "checksum": "generated-1",
    "languages": [{"language": c, "title": t} for c, t in LANGUAGES],
    "assets": list(assets.values()),
    "stations": stations,
    "texts": json.load(open("texts.json", encoding="utf-8")),
}

json.dump(data, open("data.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
```

Keep the generator and the spreadsheet in version control next to the output. A translation update is then a spreadsheet edit and a re-run, and the file is correct by construction.

## Machine translation

Machine translation is good enough for a first pass and not good enough to publish unreviewed — proper nouns, historical terms and local names are exactly where it fails, and exactly what an audioguide is full of. Translate, then have a speaker read it.

Text-to-speech has the same shape of problem: intelligible, but it mispronounces the place names your visitors are standing in. A reasonable stopgap for a language you cannot yet record.

## Checklist

- [ ] Every station exists in every language
- [ ] Every tour exists in every language
- [ ] Every `texts` key exists in every language
- [ ] Every audio asset carries the right `language`
- [ ] Each station variant references audio in its own language
- [ ] Each language's `title` is written in that language
