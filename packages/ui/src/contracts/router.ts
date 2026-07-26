/**
 * Navigation as needed by pages, structurally satisfied by
 * the RoutingService of @smartcompanion/services.
 */
export interface Router {
  push(uri: string): Promise<void>;
  pushReplace(uri: string): Promise<void>;
  pushReplaceCurrent(uri: string): Promise<void>;
}
