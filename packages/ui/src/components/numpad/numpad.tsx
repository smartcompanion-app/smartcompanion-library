import { Component, Event, Prop, EventEmitter, Host, h } from "@stencil/core";

@Component({
  tag: 'sc-numpad',
  styleUrl: 'numpad.scss',
  shadow: true,
})
export class Numpad {

  /**
   * Enable the confirm button
   */
  @Prop() full: boolean = false;

  @Event() delete: EventEmitter<void>;
  @Event() confirm: EventEmitter<void>;
  @Event() number: EventEmitter<number>;

  render() {
    return (
      <Host>
        <ion-fab-button data-testid="numpad-button-1" onClick={() => this.number.emit(1)}>1</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-2" onClick={() => this.number.emit(2)}>2</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-3" onClick={() => this.number.emit(3)}>3</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-4" onClick={() => this.number.emit(4)}>4</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-5" onClick={() => this.number.emit(5)}>5</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-6" onClick={() => this.number.emit(6)}>6</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-7" onClick={() => this.number.emit(7)}>7</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-8" onClick={() => this.number.emit(8)}>8</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-9" onClick={() => this.number.emit(9)}>9</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-delete" onClick={() => this.delete.emit()}>
          <ion-icon name="backspace-outline"></ion-icon>
        </ion-fab-button>
        <ion-fab-button data-testid="numpad-button-0" onClick={() => this.number.emit(0)}>0</ion-fab-button>
        {this.full &&
          <ion-fab-button data-testid="numpad-button-confirm" onClick={() => this.confirm.emit()}>
            <ion-icon name="send-outline"></ion-icon>
          </ion-fab-button>
        }
      </Host>
    );
  }
}