---
'@smartcompanion/data': minor
'@smartcompanion/services': minor
---

Publish valid ES modules. Both packages emitted ESM under `main: dist/index.js` without declaring `"type": "module"`, and used extensionless directory specifiers (`export * from './domain'`) that Node's ESM resolver cannot follow — so neither package could be loaded by Node at all, in either module system, and only bundlers with legacy resolution coped.

They are now ESM-only: `"type": "module"`, `module`/`moduleResolution` set to `nodenext`, an `exports` map, and explicit extensions on every relative import. `import` works from Node and from bundlers; `require()` of these packages is not supported.
