---
'@smartcompanion/ui': patch
---

Export `TranslationKey`, the text keys the pages look up, and type
`Translator.__` with it. The README lists which page needs which key. The
`ServiceFacade` still satisfies the contract and accepts any key for an app's
own texts.
