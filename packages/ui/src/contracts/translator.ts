/**
 * The translation keys the pages of this library look up. Apps must provide
 * texts for these keys in their server data; keys an app uses in its own
 * components go through the ServiceFacade, which accepts any string.
 */
export type TranslationKey = 'no-internet' | 'try-again' | 'enter-pin' | 'pin-error' | 'menu-selection' | 'menu-overview' | 'start-tour' | 'station-list' | 'view' | 'menu-map';

/**
 * Translation lookup as needed by pages, structurally satisfied by
 * the ServiceFacade of @smartcompanion/services.
 */
export interface Translator {
  __(key: TranslationKey): string;
}
