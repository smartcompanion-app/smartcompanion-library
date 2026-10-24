# Tours

A tour is a subset of your stations — a suggested route through the collection. Tours are **optional**, and the default app does not use them: it shows all stations in one list. They matter when your app routes to the library's tour pages, which is a change in your fork.

## When a tour earns its place

Reach for tours when one set of stations serves more than one visit:

- **A short route and a long one.** "Highlights in 30 minutes" and "The full collection" over the same stations.
- **Audiences.** A children's tour, an accessible route that avoids the stairs.
- **Themes.** "The Habsburgs", "Everyday life", "The garden" — each a path through the same rooms.
- **Parts of a site.** The fortress and the museum, or the ground floor and the first floor.

If none of those describe your guide, skip tours. A flat station list is simpler for you and for the visitor.

## Shape

Like stations, a tour is repeated once per language.

```json
{
  "id": "highlights",
  "language": "en",
  "number": "1",
  "title": "Highlights in 30 minutes",
  "description": "The nine pieces you should not miss.",
  "default": true,
  "stations": ["s1", "s4", "s5", "s9"],
  "images": ["tour-highlights"]
}
```

| Field | Notes |
| --- | --- |
| `id` | Shared across the language variants of the same tour |
| `language` | Which variant this is |
| `title` | Tour name in that language |
| `default` | Exactly one tour should be `true` |
| `stations` | The station **ids** in this tour |
| `images` | Asset ids — the cover image for the tour |
| `number` | Optional, a visitor-facing tour number |
| `description` | Optional, what the tour covers and how long it takes |

Full field reference: [Data format](./data-format.md#tours).

## Stations are referenced by id

```json
"stations": ["s1", "s4", "s5"]
```

Each entry is looked up as a station `id`. The schema's description says *numbers*, and in data where every station's id equals its number the two readings agree — but where they differ, only ids work. A tour referencing a station that does not exist fails to load rather than skipping it, so check every entry.

## Order

The list pages and the player page (`sc-page-station-list`, `sc-page-station-image-list`, `sc-page-stations`) sort a tour's stations by `number`, like every other station list — see [Stations](./stations.md#order). The order in the `stations` array is kept only by `sc-page-station` and `sc-page-map`.

Number your stations in walking order, and a tour inherits that order.

## The default tour

Exactly one tour should carry `"default": true`. Pages given the tour id `default` resolve it to that tour — that is how an app can link to "the main tour" without knowing its id.

If you mark none, `default` does not resolve. If you mark several, the last one wins. The schema cannot enforce "exactly one", so it is on you.

## Keeping tours in step across languages

Every language needs its own copy of every tour, and the `stations` array should be **identical** in all of them. Different lists per language means German and English visitors walking different routes, which is almost never what you want and hard to spot in review.

```json
{ "id": "highlights", "language": "de", "title": "Höhepunkte in 30 Minuten", "default": true,
  "stations": ["s1", "s4", "s5"], "images": ["tour-highlights"] },
{ "id": "highlights", "language": "en", "title": "Highlights in 30 minutes", "default": true,
  "stations": ["s1", "s4", "s5"], "images": ["tour-highlights"] }
```

`default`, `stations`, `images` and `number` are the same in both; only `title` and `description` change.

## Showing tours

The library's `sc-page-tour-list` shows the tours with their cover images and descriptions, and the list pages take a `tourId` to show one tour's stations.

The tour list also has a slot for a tour's length, next to a clock icon, which it fills from a `duration` string on the tour. The schema does not allow that field — a tour object takes no keys beyond those listed above — so a file that uses it fails validation, and one that follows the schema leaves the slot empty. Put the length in `description` instead.

Adding a tour chooser to the default app means adding routes in your fork's `app-root.tsx`:

```tsx title="src/components/app-root/app-root.tsx"
<ion-route url="/tours" component="sc-page-tour-list" componentProps={{ facade: serviceFacade }} beforeEnter={() => serviceFacade.canLoadRoute()} />
```

…plus a menu entry pointing at it. [Screens](../features/screens.md) shows what each page looks like, and [Routing](../library/routing.md) how the routes fit together.

## Checklist

- [ ] Exactly one tour has `"default": true`
- [ ] Every entry in `stations` is an existing station `id`
- [ ] The `stations` array is identical across all language variants of a tour
- [ ] Every id in `images` exists in `assets`
- [ ] Every tour exists in every language you offer
