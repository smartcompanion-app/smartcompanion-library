import { Component, Prop, State, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-pin',
  styleUrl: 'page-pin.scss',
})
export class PagePin {

  @Prop() facade: ServiceFacade;

  /**
   * The number of hours the pin is valid for.
   */
  @Prop() validHours: number = 6;

  @State() pin: string = "";
  @State() error: boolean = false;

  async componentDidLoad() {
    this.facade.getMenuService().disable();
  }

  isActivePinPosition(position: number): boolean {
    return this.pin.length == (position - 1);
  }

  hasPinPosition(position: number): boolean {
    return this.pin.length >= position;
  }

  getPinPosition(position: number): string {
    if (this.hasPinPosition(position)) {
      return this.pin[position - 1];
    }
    return "";
  }

  delete() {
    if (this.pin.length > 0) {
      this.pin = this.pin.substring(0, this.pin.length - 1);
    }
  }

  add(position: string) {
    if (this.pin.length < 4) {
      this.error = false;
      this.pin = `${this.pin}${position}`;
    }
    if (this.pin.length == 4) {
      if (this.facade.getPinService().validatePin(this.pin, this.validHours)) {
        this.facade.getRoutingService().pushReplaceCurrent('/');
      } else {
        this.pin = "";
        this.error = true;
      }
    }
  }

  render() {
    return (
      <ion-content>
        <div id="pin">
          <div id="pin-help">
            <p>{this.facade.__('enter-pin')}</p>
            <p class="error">{this.error ? this.facade.__('pin-error') : ''}</p>
          </div>
          <div id="pin-entry" class={{ "shake": this.error }}>
            {[1, 2, 3, 4].map(position =>
              <div class={{ 
                "active": this.isActivePinPosition(position), 
                "filled": this.hasPinPosition(position) 
              }}>{this.getPinPosition(position)}</div>
            )}
          </div>
          <sc-numpad
            onNumber={(e) => this.add(`${e.detail}`)}
            onDelete={() => this.delete()} />
        </div>
      </ion-content>
    );
  }
}
