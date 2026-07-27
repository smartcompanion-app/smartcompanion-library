---
'@smartcompanion/ui': patch
---

Satisfy the rules newly enabled by `@stencil/eslint-plugin` 1.4.0, whose recommended preset grew from 12 to 24 rules. `@Element()` fields are now typed as their generated element interface (`HTMLScMarqueeElement` and friends) rather than plain `HTMLElement`, and the page components return a single `<Host>` instead of an array of children. Neither changes the rendered DOM.
