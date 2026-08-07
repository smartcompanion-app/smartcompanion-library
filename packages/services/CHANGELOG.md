# @smartcompanion/services

## 0.10.0

### Minor Changes

- [#64](https://github.com/smartcompanion-app/smartcompanion-library/pull/64) [`1308858`](https://github.com/smartcompanion-app/smartcompanion-library/commit/13088588a7c9602fc82690ab9148aec566146b05) Thanks [@stefanhuber](https://github.com/stefanhuber)! - Publish valid ES modules. Both packages emitted ESM under `main: dist/index.js` without declaring `"type": "module"`, and used extensionless directory specifiers (`export * from './domain'`) that Node's ESM resolver cannot follow — so neither package could be loaded by Node at all, in either module system, and only bundlers with legacy resolution coped.

  They are now ESM-only: `"type": "module"`, `module`/`moduleResolution` set to `nodenext`, an `exports` map, and explicit extensions on every relative import. `import` works from Node and from bundlers; `require()` of these packages is not supported.

### Patch Changes

- [#64](https://github.com/smartcompanion-app/smartcompanion-library/pull/64) [`1308858`](https://github.com/smartcompanion-app/smartcompanion-library/commit/13088588a7c9602fc82690ab9148aec566146b05) Thanks [@stefanhuber](https://github.com/stefanhuber)! - Declare `engines.node: >=20` and `publishConfig.access` on all three packages, and correct the repository URL to the `git+https://` form npm expects. The `@smartcompanion/data` peer range in `services` and `ui` is now a `>=0.9.0` floor rather than a caret, so lockstep releases bump as minors instead of escalating to majors.

- [#71](https://github.com/smartcompanion-app/smartcompanion-library/pull/71) [`4c7d5a8`](https://github.com/smartcompanion-app/smartcompanion-library/commit/4c7d5a84b0e4ec8b548f696b831c77c6b11d0d9f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update the bundled swiper to v14. The station list and the image slideshow render and behave exactly as before — v14 is a TypeScript rewrite of v12 with no API, option, or markup changes — but it raises the browser baseline to Chrome/Edge 110+, Safari 16.4+ (iOS 16.4+) and Firefox 110+. Consumers that still support older browsers should stay on the previous release.
