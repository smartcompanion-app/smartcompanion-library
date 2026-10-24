# UI texts

Every piece of interface text — menu items, error messages, button labels — comes from the `texts` array in your data file, and **every text you leave out shows as its key**.

Two texts are outside your control. The loading screen shows a fixed English `Loading` with the progress percentage. And until the data file has loaded and a language is chosen, there are no texts to look up: if the very first load fails, the error screen shows the raw keys, `no-internet` and `try-again`.

## Shape

```json
"texts": [
  { "language": "en", "key": "menu-overview", "value": "Overview" },
  { "language": "de", "key": "menu-overview", "value": "Übersicht" }
]
```

Flat triples, one entry per key per language.

## The keys

Which keys you need depends on which screens your app uses. The cheapest policy is to define all of them.

### The default app

| Key | Where it appears | Example (en) |
| --- | --- | --- |
| `menu-overview` | Menu item opening the station list | `Overview` |
| `menu-selection` | Menu item opening the keypad, and the keypad screen's title | `Enter number` |
| `menu-language` | Menu item opening the language screen. Hidden when only one language is offered. | `Change language` |
| `menu-share-app` | Menu item opening the share sheet, and the share sheet's title. Hidden unless `share` is set and the device can share. | `Recommend audioguide` |
| `enter-pin` | Prompt on the PIN screen | `Please enter the PIN code you received at the ticket desk.` |
| `pin-error` | Shown when the code does not match | `The PIN code is not correct.` |
| `no-internet` | Headline on the error screen when the data could not be loaded | `The audioguide could not be loaded` |
| `try-again` | The error screen's retry button | `Try again` |

### Pages the default app does not use

| Key | Page | Example (en) |
| --- | --- | --- |
| `menu-overview`, `start-tour` | `sc-page-tour-list` | `Overview`, `Start tour` |
| `station-list` | `sc-page-station-list`, `sc-page-station-image-list` | `Stations` |
| `view` | `sc-page-station-image-list` | `View` |
| `menu-map` | `sc-page-map` | `Map` |

The library exports this list as the `TranslationKey` type, see [UI components](../library/ui.md#texts).

### When a text is missing

A missing key does not break the page. The app first tries the key with `-` and `_` swapped, then falls back to the key itself, lower-cased and with its first hyphen and first underscore each turned into a space — `try-again` reads `try again`. Readable enough to notice in testing, which is the point: check every screen in every language before you publish.

## A complete starting set

Copy this and translate it. The two demo files ([Animals](https://smartcompanion-app.github.io/data-format/animals/data.json), [Leon](https://smartcompanion-app.github.io/data-format/leon/data.json)) are real-world versions of the same thing.

```json
"texts": [
  { "language": "en", "key": "menu-overview",  "value": "Overview" },
  { "language": "en", "key": "menu-selection", "value": "Enter number" },
  { "language": "en", "key": "menu-language",  "value": "Change language" },
  { "language": "en", "key": "menu-share-app", "value": "Recommend audioguide" },
  { "language": "en", "key": "enter-pin",      "value": "Please enter the PIN code you received at the ticket desk." },
  { "language": "en", "key": "pin-error",      "value": "The PIN code is not correct." },
  { "language": "en", "key": "no-internet",    "value": "The audioguide could not be loaded" },
  { "language": "en", "key": "try-again",      "value": "Try again" },

  { "language": "de", "key": "menu-overview",  "value": "Übersicht" },
  { "language": "de", "key": "menu-selection", "value": "Nummer eingeben" },
  { "language": "de", "key": "menu-language",  "value": "Sprache wechseln" },
  { "language": "de", "key": "menu-share-app", "value": "Audioguide empfehlen" },
  { "language": "de", "key": "enter-pin",      "value": "Bitte geben Sie den PIN-Code ein, den Sie an der Kassa erhalten haben." },
  { "language": "de", "key": "pin-error",      "value": "Der PIN-Code ist nicht korrekt." },
  { "language": "de", "key": "no-internet",    "value": "Der Audioguide konnte nicht geladen werden" },
  { "language": "de", "key": "try-again",      "value": "Erneut versuchen" }
]
```

## Writing them

- **Keep them short.** These are phone screens. `Overview` fits; `Overview of all available stations` does not.
- **Match your house voice.** The formal or informal address (*Sie* or *du*, *vous* or *tu*) should be the same here as in your station texts.
- **`enter-pin` is where you explain the PIN.** It is the only place a visitor learns where the code comes from, so name it: at the ticket desk, on the back of the ticket, in the confirmation email.
- **`no-internet` covers every load failure** — a wrong data URL, a CORS problem, a host that is down, as well as a missing connection. "The audioguide could not be loaded" is more honest than "No internet connection".
- **No HTML in a value.** It is shown as text.

## Checking coverage

The [checklist script](./data-format.md#checklist) reports every key that is missing from a language. Run it before every publish.
