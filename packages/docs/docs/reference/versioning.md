# Versioning

Three things are versioned independently, and it is worth keeping them apart:

| | Scheme | Where |
| --- | --- | --- |
| The app | CalVer `YYYY.MINOR.MICRO` | [`audioguide-app` releases](https://github.com/smartcompanion-app/audioguide-app/releases) |
| The library packages | semver, in lockstep across `data`, `services` and `ui` | [npm](https://www.npmjs.com/package/@smartcompanion/ui) |
| The data format | `major.minor` — minor is additive | [`data-format`](https://github.com/smartcompanion-app/data-format) |

## The app: CalVer

App releases are versioned `YYYY.MINOR.MICRO`:

```
2026.1.0 → 2026.1.1 → 2026.2.0 → … → 2027.0.0
```

The app is deployed, not depended on: nobody calls its API, people run it. A version says *when a build is from*. The year is the only calendar claim; `MINOR` and `MICRO` count up within it and reset when the year changes.

| Bump | Meaning |
| --- | --- |
| `major` | A new calendar year. Used once a year, for nothing else. |
| `minor` | New features, **and anything that affects a fork's customization** |
| `patch` | Fixes, dependency updates, internal changes |

:::warning[Breaking changes are in the changelog, not in the number]

A renamed engraft variable lands in a `minor` release. If you maintain a customized fork, "the variable `x` was renamed to `y`" is something you can act on; an incremented number is not. **Read the changelog before merging upstream.**

:::

Releases are tagged `vYYYY.MINOR.MICRO`. Older releases carry date tags, `vYYYY-MM-DD`, from before the CalVer scheme.

### Finding out what a device runs

Every build stamps its version into a meta tag:

```js
document.querySelector('meta[name="version"]').content;
```

A local build reports `dev`; the app's release workflow writes the release version. Include it in every bug report — it is the quickest way to establish whether a problem is already fixed.

### Security fixes

There is one line of releases and no maintenance branches. Security fixes land in the next release from `main` and are not backported. If you run a fork, upgrading is the fix.

## The library: semver

`@smartcompanion/data`, `/services` and `/ui` are libraries with an API other code depends on, so they use ordinary semver — and always share one version number. A major release can break apps built on them; its changelog says how to migrate. See [Library](../library/index.md#versions).

## Your own fork

You inherit the app's scheme and do not have to keep it. Two habits that work:

- **Follow upstream.** Merge a release, apply your customization, deploy. Your version is upstream's version.
- **Version your content separately.** The `checksum` in your `data.json` is already a content version; making it meaningful — a date, a counter — tells you which content a device has, next to which app build.

Whatever you choose, write down which upstream release your deployment is based on.
