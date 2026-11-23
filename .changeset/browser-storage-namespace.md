---
'@smartcompanion/data': minor
---

`BrowserStorage` takes an optional `namespace`, e.g. the absolute URL of the app's data, that keeps its data apart from that of other apps on the same origin. `localStorage` is shared by all of them, so apps served under different paths read and overwrote each other's content, language and PIN state. With a namespace every key is prefixed with its hash, and `unsetAll()` removes only those keys.

Without a namespace nothing changes. An app that starts passing one does not see the data it stored before: visitors choose their language and enter the PIN again, and listening progress starts over. The previous keys stay in the `localStorage`.
