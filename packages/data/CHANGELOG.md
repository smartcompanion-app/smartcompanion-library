# @smartcompanion/data

## 1.0.2

## 1.0.1

## 1.0.0

### Major Changes

- [#94](https://github.com/smartcompanion-app/smartcompanion-library/pull/94) [`52ca6f2`](https://github.com/smartcompanion-app/smartcompanion-library/commit/52ca6f23697e8576483b775e5b8cb155ddd698e3) Thanks [@stefanhuber](https://github.com/stefanhuber)! - First stable release.

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

### Patch Changes

- [#84](https://github.com/smartcompanion-app/smartcompanion-library/pull/84) [`69d718a`](https://github.com/smartcompanion-app/smartcompanion-library/commit/69d718a81cad89a98440673b2193e2c5b2b36e77) Thanks [@stefanhuber](https://github.com/stefanhuber)! - Document an API removal that shipped undocumented in 0.10.0.

  [#63](https://github.com/smartcompanion-app/smartcompanion-library/pull/63) removed `ServiceLocator` from `@smartcompanion/data` and `ServiceFacade.registerDefaultServices()` from `@smartcompanion/services`, replacing the service-locator indirection with direct accessors on the facade and narrow role contracts (`StationListFacade` and friends) on the UI pages. It went out in 0.10.0 without a changeset, so the changelog for that release does not mention it — code calling `registerDefaultServices()` fails on upgrade with nothing to explain why. Nothing changes in this release; this entry exists so the removal is on the record.

  To migrate from 0.9.x:

  - Delete the `registerDefaultServices()` call. The domain services, routing and menu are available directly from the facade — `getStationService()`, `getRoutingService()`, `getMenuService()` and the rest — with no registration step.
  - If you passed a custom `resolveUrl` to it, pass it as the second constructor argument instead: `new ServiceFacade(storage, resolveUrl)`. The signature and the default are unchanged.
  - Registering an audio player and a load service is still required, and still works exactly as before.
  - Imports of `ServiceLocator` from `@smartcompanion/data` need removing. UI page components now declare the narrow contract they need rather than taking a locator.

## 0.10.0

### Minor Changes

- [#64](https://github.com/smartcompanion-app/smartcompanion-library/pull/64) [`1308858`](https://github.com/smartcompanion-app/smartcompanion-library/commit/13088588a7c9602fc82690ab9148aec566146b05) Thanks [@stefanhuber](https://github.com/stefanhuber)! - Publish valid ES modules. Both packages emitted ESM under `main: dist/index.js` without declaring `"type": "module"`, and used extensionless directory specifiers (`export * from './domain'`) that Node's ESM resolver cannot follow — so neither package could be loaded by Node at all, in either module system, and only bundlers with legacy resolution coped.

  They are now ESM-only: `"type": "module"`, `module`/`moduleResolution` set to `nodenext`, an `exports` map, and explicit extensions on every relative import. `import` works from Node and from bundlers; `require()` of these packages is not supported.

### Patch Changes

- [#64](https://github.com/smartcompanion-app/smartcompanion-library/pull/64) [`1308858`](https://github.com/smartcompanion-app/smartcompanion-library/commit/13088588a7c9602fc82690ab9148aec566146b05) Thanks [@stefanhuber](https://github.com/stefanhuber)! - Declare `engines.node: >=20` and `publishConfig.access` on all three packages, and correct the repository URL to the `git+https://` form npm expects. The `@smartcompanion/data` peer range in `services` and `ui` is now a `>=0.9.0` floor rather than a caret, so lockstep releases bump as minors instead of escalating to majors.

- [#71](https://github.com/smartcompanion-app/smartcompanion-library/pull/71) [`4c7d5a8`](https://github.com/smartcompanion-app/smartcompanion-library/commit/4c7d5a84b0e4ec8b548f696b831c77c6b11d0d9f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update the bundled swiper to v14. The station list and the image slideshow render and behave exactly as before — v14 is a TypeScript rewrite of v12 with no API, option, or markup changes — but it raises the browser baseline to Chrome/Edge 110+, Safari 16.4+ (iOS 16.4+) and Firefox 110+. Consumers that still support older browsers should stay on the previous release.
