---
'@smartcompanion/ui': minor
---

Declare an `exports` map and `sideEffects` on `@smartcompanion/ui`, so the
package states which entry points it supports instead of exposing every file it
happens to ship. Two are public: the root, and `@smartcompanion/ui/loader` for
`defineCustomElements`. Everything else — `dist/` internals and the bundled
`src/` — is now closed.

Nothing about the supported entry points changes: the root still resolves to the
CommonJS build under Node and the ES module build under a bundler, exactly as
`main` and `module` did before. Only paths that were never intended as API stop
resolving, so an import reaching into `dist/` or `src/` directly needs to move
to the root export.

This is deliberately landing before 1.0. Adding an `exports` map to a package
that already has one is a breaking change, so the window for doing it quietly
closes at the first stable release.
