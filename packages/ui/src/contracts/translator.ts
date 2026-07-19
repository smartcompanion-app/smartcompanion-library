/**
 * Translation lookup as needed by pages, structurally satisfied by
 * the ServiceFacade of @smartcompanion/services.
 */
export interface Translator {
  __(key: string): string;
}
