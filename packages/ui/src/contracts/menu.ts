/**
 * Menu control as needed by pages, structurally satisfied by
 * the MenuService of @smartcompanion/services.
 */
export interface Menu {
  enable(): Promise<void>;
  disable(): Promise<void>;
  open(): Promise<void>;
}
