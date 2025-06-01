import { Storage } from "../../storage";

export class PinRepository {

    protected storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    } 

    now(): number {
        return Math.trunc(Date.now() / 1000);
    }

    getHoursInSeconds(hours: number): number {
        return Math.trunc(hours * 3600);
    }

    checkPin(pin: string): boolean {
        if (this.storage.has('pins')) {
            const pins: string[] = this.storage.get('pins');
            return pins.some(storedPin => pin == storedPin);
        } else {
            return false;
        }        
    }

    isValid(): boolean {
        if (
            this.storage.has('pin-validation') &&
            parseInt(this.storage.get('pin-validation')) > this.now()
        ) {
            return true;
        } else {
            return false;
        }
    }

    validatePin(pin: string, validHours = 6): boolean {
        if (this.checkPin(pin)) {
            this.storage.set('pin-validation', this.now() + this.getHoursInSeconds(validHours));
            return true;
        } else {
            return false;
        }
    }

    isPinValidationRequired(): boolean {
        return (
            this.storage.has('pins') &&
            Array.isArray(this.storage.get('pins')) &&
            this.storage.get('pins').length > 0
        );
    }
}
