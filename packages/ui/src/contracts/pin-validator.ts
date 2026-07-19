/**
 * PIN validation as needed by the pin page, structurally satisfied by
 * the PinService of @smartcompanion/data.
 */
export interface PinValidator {
  validatePin(pin: string, validHours: number): boolean;
}
