/**
 * Navigation as needed by pages, structurally satisfied by
 * the RoutingService of @smartcompanion/services.
 */
export interface Router {
  /** Navigate on a new history entry, with a forward transition */
  push(uri: string): Promise<void>;
  /** Navigate in place of the current history entry, without a transition */
  replace(uri: string): Promise<void>;
  /** Go back a page, or to `fallbackUri` when the app has none to go back to */
  back(fallbackUri?: string): Promise<void>;
}
