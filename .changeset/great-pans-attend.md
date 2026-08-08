---
'@smartcompanion/data': major
'@smartcompanion/services': major
'@smartcompanion/ui': major
---

First stable release.

The three packages have been usable together for a while; what changes here is
the promise. From 1.0.0 the public surface is settled and semver applies to it:
a breaking change needs a major, and the entry points a package exposes are the
ones it will keep exposing.

What that surface is, per package:

- **`@smartcompanion/data`** — the domain services and their updaters, the
  `Storage` interface with its browser and in-memory implementations, and the
  online and offline load services.
- **`@smartcompanion/services`** — `ServiceFacade` and its accessors, plus
  `AudioPlayerService`, `MenuService` and `RoutingService`.
- **`@smartcompanion/ui`** — the custom elements, and the entry points named in
  the package's `exports` map: the root, `./loader`, and `./dist/collection/*`.
  Deep imports into anything else were never intended as API and no longer
  resolve.

Two requirements moved in this release and need attention when upgrading from
0.10.x:

- **`@smartcompanion/native-audio-player` 1.0 is now required** by
  `@smartcompanion/services`. The plugin renamed its player event, which this
  package handles internally, but the peer range no longer accepts 0.5.x.
- **`sc-page-map` renders with maplibre-gl 6.** The component's own props are
  unchanged; an app that pinned maplibre 5 itself will need to move.

Nothing else about using these packages changes. Most of the work leading here
went into things that leave no trace in the API — the entry points are declared
rather than implied, every component has a rendering test, the packages carry
READMEs, and one API removal that shipped undocumented in 0.10.0 is now on the
record.
